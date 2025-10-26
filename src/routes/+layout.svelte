<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    import { isSimulationMode } from '$lib/settings-store';
    import { start, stop } from '$lib/simulator';
    

	let { children } = $props();

    $effect(() => {
        if ($isSimulationMode) {
            start();
        } else {
            stop();
        }
    });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
