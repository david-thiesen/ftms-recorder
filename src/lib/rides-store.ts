import { writable } from 'svelte/store';

const DB_NAME = 'ftms-recorder';
const DB_VERSION = 1;
const RIDES_STORE_NAME = 'rides';

export interface Ride {
	id?: number;
	name: string;
	date: Date;
	data: Uint8Array;
}

let db: IDBDatabase;

function getDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (db) {
			return resolve(db);
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => {
			reject(request.error);
		};

		request.onsuccess = () => {
			db = request.result;
			resolve(db);
		};

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(RIDES_STORE_NAME)) {
				db.createObjectStore(RIDES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
			}
		};
	});
}

export async function addRide(ride: Ride): Promise<void> {
	const db = await getDb();
	const transaction = db.transaction(RIDES_STORE_NAME, 'readwrite');
	const store = transaction.objectStore(RIDES_STORE_NAME);
	store.add(ride);
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

export async function getAllRides(): Promise<Ride[]> {
	const db = await getDb();
	const transaction = db.transaction(RIDES_STORE_NAME, 'readonly');
	const store = transaction.objectStore(RIDES_STORE_NAME);
	const request = store.getAll();
	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = () => {
			reject(request.error);
		};
	});
}

export async function getRide(id: number): Promise<Ride> {
	const db = await getDb();
	const transaction = db.transaction(RIDES_STORE_NAME, 'readonly');
	const store = transaction.objectStore(RIDES_STORE_NAME);
	const request = store.get(id);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = () => {
			reject(request.error);
		};
	});
}

export async function deleteRide(id: number): Promise<void> {
	const db = await getDb();
	const transaction = db.transaction(RIDES_STORE_NAME, 'readwrite');
	const store = transaction.objectStore(RIDES_STORE_NAME);
	store.delete(id);
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

export const rides = writable<Ride[]>([]);

export async function loadRides() {
	const allRides = await getAllRides();
	rides.set(allRides);
}
