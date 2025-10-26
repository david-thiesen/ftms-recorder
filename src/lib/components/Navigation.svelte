<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Home, BarChart3, Settings } from 'lucide-svelte';

	export let activeTab: 'live' | 'settings' | 'rides' = 'live';

	const dispatch = createEventDispatcher();

	function setTab(tab: 'live' | 'settings' | 'rides') {
		dispatch('setTab', tab);
	}
</script>

<nav class="bg-base-100 shadow-sm">
    <div class="mx-auto max-w-6xl px-4">
        <div class="flex h-12 items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="menu menu-horizontal p-0">
                    <button
                        class="btn btn-ghost"
                        class:btn-active={activeTab === 'live'}
                        on:click={() => setTab('live')}
                        aria-label="Live data view"
                    >
                        <Home class="h-5 w-5" />
                    </button>

                    <button
                        class="btn btn-ghost"
                        class:btn-active={activeTab === 'rides'}
                        on:click={() => setTab('rides')}
                        aria-label="Rides history"
                    >
                        <BarChart3 class="h-5 w-5" />
                    </button>

                    <button
                        class="btn btn-ghost"
                        class:btn-active={activeTab === 'settings'}
                        on:click={() => setTab('settings')}
                        aria-label="Settings page"
                    >
                        <Settings class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div class="text-lg font-semibold">FTMS Recorder</div>
            <div class="w-8"></div>
        </div>
    </div>
</nav>
