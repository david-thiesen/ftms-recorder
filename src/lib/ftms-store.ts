import { writable } from 'svelte/store';

export interface FtmsData {
	power: number | null;
	cadence: number | null;
	activeTime: number | null;
	movedDistance: number | null;
	heartRate: number | null;
	speed: number | null;
	pace: number | null;
}

export const ftmsStore = writable<FtmsData>({
	power: null,
	cadence: null,
	activeTime: 0,
	movedDistance: 0,
	heartRate: null,
	speed: null,
	pace: null
});
