import { ftmsStore } from './ftms-store';

let intervalId: ReturnType<typeof setInterval> | null = null;
let activeTime = 0;
let movedDistance = 0;

function generateRandomData() {
    const power = Math.floor(Math.random() * 200) + 50; // 50-250 W
    const cadence = Math.floor(Math.random() * 40) + 70; // 70-110 rpm
    const heartRate = Math.floor(Math.random() * 40) + 100; // 100-140 bpm
    const speed = (power / 10) + (Math.random() - 0.5); // m/s

    activeTime += 1;
    movedDistance += speed / 1000; // km

    ftmsStore.update(currentData => ({
        ...currentData,
        power,
        cadence,
        heartRate,
        speed,
        activeTime,
        movedDistance,
        pace: speed > 0 ? 1 / (speed * 60 / 1000) : 0, // min/km
    }));
}

export function start() {
    if (intervalId) {
        return;
    }
    intervalId = setInterval(generateRandomData, 1000);
}

export function stop() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    activeTime = 0;
    movedDistance = 0;
    ftmsStore.set({
        power: null,
        cadence: null,
        activeTime: 0,
        movedDistance: 0,
        heartRate: null,
        speed: null,
        pace: null,
    });
}
