<script lang="ts">
	import { ftmsStore, type FtmsData } from '$lib/ftms-store';
    import { Encoder, Profile, Utils } from '@garmin/fitsdk';
    import { addRide } from '$lib/rides-store';
    import { Circle, Square } from 'lucide-svelte';

    let isRecording = false;
    let recordData: FtmsData[] = [];

    ftmsStore.subscribe(data => {
        if (isRecording) {
            recordData.push(data);
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

	function formatPace(pace: number | null): string {
		if (pace === null) return '00:00';
		const minutes = Math.floor(pace);
		const seconds = Math.round((pace - minutes) * 60);
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

    async function toggleRecording() {
        isRecording = !isRecording;

        if (!isRecording) {
            await saveRide();
            recordData = [];
        }
    }

    async function saveRide() {
        const now = new Date();
        const startTime = Utils.convertDateToDateTime(now);
        let timestamp = startTime;

        const mesgs = [];

        mesgs.push({
            mesgNum: Profile.MesgNum.FILE_ID,
            type: "activity",
            manufacturer: "development",
            product: 0,
            timeCreated: startTime,
            serialNumber: 1234,
        });

        mesgs.push({
            mesgNum: Profile.MesgNum.DEVICE_INFO,
            deviceIndex: "creator",
            manufacturer: "development",
            product: 0,
            productName: "FTMS Recorder",
            serialNumber: 1234,
            softwareVersion: 1.0,
            timestamp: startTime,
        });

        mesgs.push({
            mesgNum: Profile.MesgNum.EVENT,
            timestamp: startTime,
            event: "timer",
            eventType: "start",
        });

        for (const data of recordData) {
            mesgs.push({
                mesgNum: Profile.MesgNum.RECORD,
                timestamp: timestamp,
                distance: data.movedDistance ? data.movedDistance * 1000 : undefined,
                enhancedSpeed: data.speed ?? undefined,
                heartRate: data.heartRate ?? undefined,
                cadence: data.cadence ?? undefined,
                power: data.power ?? undefined,
            });
            timestamp++;
        }

        mesgs.push({
            mesgNum: Profile.MesgNum.EVENT,
            timestamp: timestamp,
            event: "timer",
            eventType: "stop",
        });

        mesgs.push({
            mesgNum: Profile.MesgNum.LAP,
            messageIndex: 0,
            timestamp: timestamp,
            startTime: startTime,
            totalElapsedTime: timestamp - startTime,
            totalTimerTime: timestamp - startTime,
        });

        mesgs.push({
            mesgNum: Profile.MesgNum.SESSION,
            messageIndex: 0,
            timestamp: timestamp,
            startTime: startTime,
            totalElapsedTime: timestamp - startTime,
            totalTimerTime: timestamp - startTime,
            sport: "cycling",
            subSport: "generic",
            firstLapIndex: 0,
            numLaps: 1,
        });

        mesgs.push({
            mesgNum: Profile.MesgNum.ACTIVITY,
            timestamp: timestamp,
            numSessions: 1,
            localTimestamp: timestamp + now.getTimezoneOffset() * -60,
            totalTimerTime: timestamp - startTime,
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
                data: uint8Array,
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
                        {($ftmsStore.movedDistance ?? 0).toFixed(2)}<span class="text-lg"> km</span>
                    </p>
                </div>
            </div>

            <div class="card bg-base-100 shadow">
                <div class="card-body flex flex-col items-center justify-center p-4 text-center">
                    <h3 class="text-lg font-medium">Pace</h3>
                    <p class="text-4xl font-bold">
                        {formatPace($ftmsStore.pace)}<span class="text-lg"> /km</span>
                    </p>
                </div>
            </div>

            <div class="card col-span-2 bg-base-100 shadow">
                <div class="card-body flex flex-col items-center justify-center p-4 text-center">
                    <h3 class="text-lg font-medium">Active Time</h3>
                    <p class="text-4xl font-bold">{formatTime($ftmsStore.activeTime)}</p>
                </div>
            </div>
        </div>

        <div class="flex justify-center py-4">
            <button onclick={toggleRecording} type="button" class="btn btn-circle btn-lg {isRecording ? 'btn-error' : 'btn-primary'}">
                {#if isRecording}
                    <Square class="h-8 w-8" />
                {:else}
                    <Circle class="h-8 w-8" />
                {/if}
            </button>
        </div>
    </div>
</div>
