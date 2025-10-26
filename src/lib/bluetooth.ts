import { writable, get } from 'svelte/store';
import { ftmsStore, type FtmsData } from './ftms-store';
import { settings } from './settings';

export const ftmsDevice = writable<BluetoothDevice | null>(null);
export const hrDevice = writable<BluetoothDevice | null>(null);
export const isScanning = writable(false);
export const availableFTMSDevices = writable<BluetoothDevice[]>([]);
export const availableHRDevices = writable<BluetoothDevice[]>([]);

let _ftmsChar: BluetoothRemoteGATTCharacteristic | null = null;
let _cpChar: BluetoothRemoteGATTCharacteristic | null = null;
let _hrChar: BluetoothRemoteGATTCharacteristic | null = null;

function parseHeartRateMeasurement(value: DataView): number {
    const flags = value.getUint8(0);
    const hr16 = (flags & 0x01) !== 0;
    let offset = 1;
    let hr = 0;
    if (hr16) {
        hr = value.getUint16(offset, true);
        offset += 2;
    } else {
        hr = value.getUint8(offset);
        offset += 1;
    }
    return hr;
}

function parseIndoorBikeData(value: DataView) {
    const flags = value.getUint16(0, true);
    let offset = 2;
    let speedMs: number | null = null;
    let cadence: number | null = null;
    let power: number | null = null;

    const speedInMph = get(settings).speedInMph;

    // Instantaneous Speed present
    if (flags & 0x02) {
        if (value.byteLength >= offset + 2) {
            const speedValue = value.getUint16(offset, true) / 100;
            if (speedInMph) {
                // convert mph to m/s
                speedMs = speedValue * 0.44704;
            } else {
                // convert km/h to m/s
                speedMs = speedValue / 3.6;
            }
            offset += 2;
        }
    }

    // Instantaneous Cadence present
    if (flags & 0x04) {
        if (value.byteLength >= offset + 2) {
            cadence = value.getUint16(offset, true) / 2;
            offset += 2;
        }
    }

    // Instantaneous Power present
    if (flags & 0x40) {
        if (value.byteLength >= offset + 2) {
            power = value.getInt16(offset, true);
            offset += 2;
        }
    }

    return { speedMs, cadence, power };
}

async function disconnectDevice(device: BluetoothDevice | null) {
    if (!device) return;
    try {
        if (device.gatt && device.gatt.connected) await device.gatt.disconnect();
    } catch (_) {
        /* ignore */
    }
}

export async function connectFTMS(device: BluetoothDevice) {
    try {
        ftmsDevice.set(device);
        device.addEventListener('gattserverdisconnected', async () => {
            ftmsDevice.set(null);
            _ftmsChar = _cpChar = null;
        });

        const server = await device.gatt?.connect();
        if (!server) throw new Error('GATT connect failed');

        const cpService = await server.getPrimaryService('00001818-0000-1000-8000-00805f9b34fb').catch(() => null);
        if (cpService) {
            const cpChar = await cpService.getCharacteristic('00002a63-0000-1000-8000-00805f9b34fb');
            _cpChar = cpChar;
            await cpChar.startNotifications();
            cpChar.addEventListener('characteristicvaluechanged', (ev: Event) => {
                const ch = ev.target as BluetoothRemoteGATTCharacteristic;
                const dv = ch.value!;
                if (dv.byteLength >= 4) {
                    const instPower = dv.getInt16(2, true);
                    ftmsStore.update((s: FtmsData) => ({ ...s, power: instPower }));
                }
            });
        }

        const fitnessService = await server.getPrimaryService('00001826-0000-1000-8000-00805f9b34fb').catch(() => null);
        if (fitnessService) {
            const ibChar = await fitnessService.getCharacteristic('00002ad2-0000-1000-8000-00805f9b34fb').catch(() => null);
            if (ibChar) {
                _ftmsChar = ibChar;
                await ibChar.startNotifications();
                ibChar.addEventListener('characteristicvaluechanged', (ev: Event) => {
                    const ch = ev.target as BluetoothRemoteGATTCharacteristic;
                    const dv = ch.value!;
                    const parsed = parseIndoorBikeData(dv);
                    ftmsStore.update((s: FtmsData) => ({
                        ...s,
                        speed: parsed.speedMs ?? s.speed,
                        cadence: parsed.cadence ?? s.cadence,
                        power: parsed.power ?? s.power
                    }));
                });
            }
        }

        if (!_cpChar && !_ftmsChar) {
            console.warn('No known FTMS/Cycling Power characteristics found on device.');
        }
    } catch (error) {
        console.error('FTMS connection failed:', error);
        alert('FTMS connection failed: ' + (error as Error).message);
    }
}

export async function connectHR(device: BluetoothDevice) {
    try {
        hrDevice.set(device);
        device.addEventListener('gattserverdisconnected', () => {
            hrDevice.set(null);
            _hrChar = null;
            ftmsStore.update((s: FtmsData) => ({ ...s, heartRate: null }));
        });

        const server = await device.gatt?.connect();
        if (!server) throw new Error('GATT connect failed');

        const hrService = await server.getPrimaryService('0000180d-0000-1000-8000-00805f9b34fb');
        const hrChar = await hrService.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb');
        _hrChar = hrChar;
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (ev: Event) => {
            const ch = ev.target as BluetoothRemoteGATTCharacteristic;
            const dv = ch.value!;
            const hr = parseHeartRateMeasurement(dv);
            ftmsStore.update((s: FtmsData) => ({ ...s, heartRate: hr }));
        });
    } catch (error) {
        console.error('HR connection failed:', error);
        alert('HR connection failed: ' + (error as Error).message);
    }
}

export async function scanForFTMS() {
    if (!navigator.bluetooth) {
        alert('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
        return;
    }

    isScanning.set(true);
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['fitness_machine'] }, { services: ['cycling_power'] }],
            optionalServices: ['fitness_machine', 'cycling_power']
        });
        if (device) {
            availableFTMSDevices.update(devices => [...devices, device]);
        }
    } catch (error) {
        console.error('FTMS scan failed:', error);
        if (error.name === 'NotFoundError') {
            alert('No fitness machines found nearby. Make sure your device is in pairing mode.');
        } else if (error.name === 'SecurityError') {
            alert('Bluetooth permission denied. Please allow Bluetooth access.');
        } else {
            alert(`Failed to scan: ${error.message}`);
        }
    } finally {
        isScanning.set(false);
    }
}

export async function scanForHR() {
    if (!navigator.bluetooth) {
        alert('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
        return;
    }

    isScanning.set(true);
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['heart_rate'] }],
            optionalServices: ['heart_rate']
        });
        if (device) {
            availableHRDevices.update(devices => [...devices, device]);
        }
    } catch (error) {
        console.error('HR scan failed:', error);
        if (error.name === 'NotFoundError') {
            alert('No heart rate devices found nearby. Make sure your device is in pairing mode.');
        } else if (error.name === 'SecurityError') {
            alert('Bluetooth permission denied. Please allow Bluetooth access.');
        } else {
            alert(`Failed to scan: ${error.message}`);
        }
    } finally {
        isScanning.set(false);
    }
}

export async function disconnectFTMS(device: BluetoothDevice) {
    if (_ftmsChar) {
        try {
            await _ftmsChar.stopNotifications();
        } catch {}
        _ftmsChar = null;
    }
    if (_cpChar) {
        try {
            await _cpChar.stopNotifications();
        } catch {}
        _cpChar = null;
    }
    await disconnectDevice(device);
    ftmsDevice.set(null);
}

export async function disconnectHR(device: BluetoothDevice) {
    if (_hrChar) {
        try {
            await _hrChar.stopNotifications();
        } catch {}
        _hrChar = null;
    }
    await disconnectDevice(device);
    hrDevice.set(null);
}