import { writable } from 'svelte/store';

export interface AppSettings {
    units: 'metric' | 'imperial';
    dark: boolean;
    speedInMph: boolean;
    keepScreenOn: boolean;
}

const defaultSettings: AppSettings = {
    units: 'metric',
    dark: false,
    speedInMph: false,
    keepScreenOn: true,
};

const storedSettings = typeof window !== 'undefined' ? localStorage.getItem('ftms:settings') : null;

const initialSettings = storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;

export const settings = writable<AppSettings>(initialSettings);

if (typeof window !== 'undefined') {
    settings.subscribe(value => {
        localStorage.setItem('ftms:settings', JSON.stringify(value));
    });
}
