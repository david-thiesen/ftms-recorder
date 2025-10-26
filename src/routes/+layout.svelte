<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    import { isSimulationMode } from '$lib/settings-store';
    import { start, stop } from '$lib/simulator';
    
	import { settings } from '$lib/settings';

	let { children } = $props();

    $effect(() => {
        if ($isSimulationMode) {
            start();
        } else {
            stop();
        }
    });

	let wakeLock: WakeLockSentinel | null = null;

	async function acquireWakeLock() {
		if ('wakeLock' in navigator && $settings.keepScreenOn) {
			try {
				wakeLock = await navigator.wakeLock.request('screen');
				wakeLock.addEventListener('release', () => {
					wakeLock = null;
				});
			} catch (err) {
				wakeLock = null;
			}
		}
	}

	function releaseWakeLock() {
		if (wakeLock) {
			wakeLock.release();
			wakeLock = null;
		}
	}

	$effect(() => {
		if ($settings.keepScreenOn) {
			acquireWakeLock();
		} else {
			releaseWakeLock();
		}

		function handleVisibilityChange() {
			if (document.visibilityState === 'visible') {
				acquireWakeLock();
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			releaseWakeLock();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
