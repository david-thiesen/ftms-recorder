import { writable } from 'svelte/store';

export interface FtmsData {
	power: number | null;
	cadence: number | null;
	workoutTime: number | null;
	movedDistance: number | null;
	heartRate: number | null;
	speed: number | null;
	pace: number | null;
	resistance: number | null;
	timestamp?: number; // Added for recording
}

function createFtmsStore() {
	const { subscribe, update, set } = writable<FtmsData>({
		power: null,
		cadence: null,
		workoutTime: 0,
		movedDistance: 0,
		heartRate: null,
		speed: null,
		pace: null,
		resistance: null
	});

	return {
		subscribe,
		set,
		updateData: (newData: Partial<FtmsData>) => {
			update((currentData) => ({ ...currentData, ...newData }));
		},
		resetWorkout: () => {
			update((s) => ({ ...s, workoutTime: 0, movedDistance: 0 }));
		}
	};
}

export const ftmsStore = createFtmsStore();
