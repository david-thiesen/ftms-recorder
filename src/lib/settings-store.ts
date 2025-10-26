import { writable } from 'svelte/store';

export const isSimulationMode = writable<boolean>(false);
