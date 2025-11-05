import { ftmsStore } from './ftms-store';

let intervalId: ReturnType<typeof setInterval> | null = null;
let activeTime = 0;
let movedDistance = 0;

function generateRandomData() {
	const power = Math.floor(Math.random() * 200) + 50; // 50-250 W
	const cadence = Math.floor(Math.random() * 40) + 70; // 70-110 rpm
	const heartRate = Math.floor(Math.random() * 40) + 100; // 100-140 bpm
	const speed = power / 10 + (Math.random() - 0.5); // m/s
	const resistance = Math.floor(Math.random() * 20) + 1; // 1-20 resistance level

	activeTime += 1;
	movedDistance += speed / 1000; // km

	ftmsStore.update((currentData) => ({
		...currentData,
		power,
		cadence,
		heartRate,
		speed,
		activeTime,
		movedDistance,
		resistance,
		pace: null
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
		resistance: null
	});
}
