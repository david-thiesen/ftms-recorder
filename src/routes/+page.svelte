<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import LiveDataView from '$lib/components/LiveDataView.svelte';
	import SettingsView from '$lib/components/SettingsView.svelte';
	import RidesView from '$lib/components/RidesView.svelte';

	let tab: 'live' | 'settings' | 'rides' = 'live';

	function setTab(event: CustomEvent<'live' | 'settings' | 'rides'>) {
		tab = event.detail;
	}
</script>

<Navigation activeTab={tab} on:setTab={setTab} />

{#if tab === 'live'}
	<LiveDataView />
{:else if tab === 'settings'}
	<SettingsView />
{:else if tab === 'rides'}
	<RidesView />
{/if}
