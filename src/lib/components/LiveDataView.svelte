<script lang="ts">
	import { ftmsStore, type FtmsData } from '$lib/ftms-store';
	import { Encoder, Profile, Utils } from '@garmin/fitsdk';
	import { addRide } from '$lib/rides-store';
	import { Circle, Square } from 'lucide-svelte';
	import { isRecording } from '$lib/recording-store';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';

	let recordData: FtmsData[] = [];
	let workoutTime = 0;
	let workoutTimer: any;
	let recordTimer: any;
	let totalDistance = 0;
	let lastDataTimestamp: number | undefined;
	let currentData: FtmsData = {};

	// Update current data on every store change, but don't record yet
	ftmsStore.subscribe((data) => {
		if (get(isRecording)) {
			// Update distance calculation
			if (data.speed && lastDataTimestamp) {
				const now = Date.now();
				const timeDelta = (now - lastDataTimestamp) / 1000; // seconds
				totalDistance += data.speed * timeDelta; // meters
			}
			lastDataTimestamp = Date.now();

			// Merge incoming data into current state (partial updates from different characteristics)
			currentData = { ...currentData, ...data };
		}
	});

	function formatTime(seconds: number | null): string {
		if (seconds === null) return '00:00:00';
		const h = Math.floor(seconds / 3600)
			.toString()
			.padStart(2, '0');
		const m = Math.floor((seconds % 3600) / 60)
			.toString()
			.padStart(2, '0');
		const s = Math.floor(seconds % 60)
			.toString()
			.padStart(2, '0');
		return `${h}:${m}:${s}`;
	}

	async function toggleRecording() {
		isRecording.update((r) => !r);

		if (get(isRecording)) {
			// Start recording
			workoutTime = 0;
			totalDistance = 0;
			recordData = [];
			currentData = {};
			lastDataTimestamp = Date.now();

			// Timer for workout time display
			workoutTimer = setInterval(() => {
				workoutTime++;
			}, 1000);

			// Timer for recording data snapshots every second
			recordTimer = setInterval(() => {
				// Only record if we have some data
				if (Object.keys(currentData).length > 0) {
					recordData.push({
						...currentData,
						movedDistance: totalDistance / 1000,
						timestamp: Date.now()
					});
				}
			}, 1000);
		} else {
			// Stop recording
			clearInterval(workoutTimer);
			clearInterval(recordTimer);
			await saveRide();
			recordData = [];
			currentData = {};
			lastDataTimestamp = undefined;
		}
	}

	onDestroy(() => {
		if (workoutTimer) clearInterval(workoutTimer);
		if (recordTimer) clearInterval(recordTimer);
	});

	async function saveRide() {
		if (recordData.length === 0) {
			alert('No data was recorded. The ride will not be saved.');
			return;
		}
		const now = new Date();
		const startTime = Utils.convertDateToDateTime(now) - (recordData[0]?.timestamp ? (now.getTime() - recordData[0].timestamp) / 1000: 0);
		let timestamp = startTime;

		const mesgs = [];

		mesgs.push({
			mesgNum: Profile.MesgNum.FILE_ID,
			type: 'activity',
			manufacturer: 'development',
			product: 0,
			timeCreated: startTime,
			serialNumber: 1234
		});

		mesgs.push({
			mesgNum: Profile.MesgNum.DEVICE_INFO,
			deviceIndex: 'creator',
			manufacturer: 'development',
			product: 0,
			productName: 'FTMS Recorder',
			serialNumber: 1234,
			softwareVersion: 1.0,
			timestamp: startTime
		});

		mesgs.push({
			mesgNum: Profile.MesgNum.EVENT,
			timestamp: startTime,
			event: 'timer',
			eventType: 'start'
		});

		for (const data of recordData) {
			timestamp = startTime + (data.timestamp - recordData[0].timestamp) / 1000;
			mesgs.push({
				mesgNum: Profile.MesgNum.RECORD,
				timestamp: timestamp,
				distance: data.movedDistance ? data.movedDistance * 1000 : undefined,
				enhancedSpeed: data.speed ?? undefined,
				heartRate: data.heartRate ?? undefined,
				cadence: data.cadence ?? undefined,
				power: data.power ?? undefined,
				resistance: data.resistance ?? undefined
			});
		}

		mesgs.push({
			mesgNum: Profile.MesgNum.EVENT,
			timestamp: timestamp,
			event: 'timer',
			eventType: 'stop'
		});

		mesgs.push({
			mesgNum: Profile.MesgNum.LAP,
			messageIndex: 0,
			timestamp: timestamp,
			startTime: startTime,
			totalElapsedTime: workoutTime,
			totalTimerTime: workoutTime,
			totalDistance: totalDistance
		});

		mesgs.push({
			mesgNum: Profile.MesgNum.SESSION,
			messageIndex: 0,
			timestamp: timestamp,
			startTime: startTime,
			totalElapsedTime: workoutTime,
			totalTimerTime: workoutTime,
			sport: 'cycling',
			subSport: 'generic',
			firstLapIndex: 0,
			numLaps: 1,
			totalDistance: totalDistance
		});

		mesgs.push({
			mesgNum: Profile.MesgNum.ACTIVITY,
			timestamp: timestamp,
			numSessions: 1,
			localTimestamp: timestamp + now.getTimezoneOffset() * -60,
			totalTimerTime: workoutTime
		});

		try {
			const encoder = new Encoder({});
			mesgs.forEach((mesg) => {
				encoder.writeMesg(mesg);
			});
			const uint8Array = encoder.close();

			await addRide({
				name: `Ride ${now.toLocaleString()}`,
				date: now,
				data: uint8Array
			});
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="max-w-xl p-6">
	<div class="relative flex h-full flex-col p-4">
		<div class="grid flex-grow grid-cols-2 gap-4">
			<!-- DaisyUI card -->
			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Power</h3>
					<p class="text-4xl font-bold">{$ftmsStore.power ?? 0}<span class="text-lg"> W</span></p>
				</div>
			</div>

			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Cadence</h3>
					<p class="text-4xl font-bold">
						{$ftmsStore.cadence ?? 0}<span class="text-lg"> rpm</span>
					</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Speed</h3>
					<p class="text-4xl font-bold">
						{(($ftmsStore.speed ?? 0) * 3.6).toFixed(1)}<span class="text-lg"> km/h</span>
					</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Heart Rate</h3>
					<p class="text-4xl font-bold">
						{$ftmsStore.heartRate ?? '---'}<span class="text-lg"> bpm</span>
					</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Distance</h3>
					<p class="text-4xl font-bold">
						{(totalDistance / 1000).toFixed(2)}<span class="text-lg"> km</span>
					</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Resistance</h3>
					<p class="text-4xl font-bold">
						{$ftmsStore.resistance ?? 0}
					</p>
				</div>
			</div>

			<div class="card col-span-2 bg-base-100 shadow">
				<div class="card-body flex flex-col items-center justify-center p-4 text-center">
					<h3 class="text-lg font-medium">Workout Time</h3>
					<p class="text-4xl font-bold">{formatTime(workoutTime)}</p>
				</div>
			</div>
		</div>

		<div class="flex justify-center py-4">
			<button
				onclick={toggleRecording}
				type="button"
				class="btn btn-circle btn-lg {$isRecording ? 'btn-error' : 'btn-primary'}"
			>
				{#if $isRecording}
					<Square class="h-8 w-8" />
				{:else}
					<Circle class="h-8 w-8" />
				{/if}
			</button>
		</div>
	</div>
</div>
