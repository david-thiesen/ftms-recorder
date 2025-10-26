<script lang="ts">
    import { 
        ftmsDevice, 
        hrDevice, 
        isScanning, 
        availableFTMSDevices, 
        availableHRDevices, 
        connectFTMS, 
        connectHR, 
        scanForFTMS, 
        scanForHR, 
        disconnectFTMS, 
        disconnectHR 
    } from '$lib/bluetooth';
    import { isSimulationMode } from '$lib/settings-store';
    import { settings, type AppSettings } from '$lib/settings';

    const defaultSettings: AppSettings = {
        units: 'metric',
        dark: false,
        speedInMph: false,
    };

    $effect(() => {
        document.documentElement.setAttribute('data-theme', $settings.dark ? 'dark' : 'light');
    });

	function resetSettings() {
        settings.set(defaultSettings);
	}
</script>

<div class="max-w-xl p-6">
    <div class="space-y-8">
        <!-- Bluetooth Connections -->
        <div class="card bg-base-100 shadow">
            <div class="card-body">
                <h3 class="mb-4 card-title text-lg">Bluetooth Connections</h3>
                <div class="flex flex-col gap-4">
                    <!-- FTMS Section -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span>Fitness Machine</span>
                            {#if $ftmsDevice}
                                <div class="flex items-center gap-2">
                                    <span class="text-sm opacity-75">{$ftmsDevice.name}</span>
                                    <button class="btn btn-ghost btn-sm" onclick={() => disconnectFTMS($ftmsDevice)}>
                                        Disconnect
                                    </button>
                                </div>
                            {:else}
                                <button class="btn btn-primary" onclick={scanForFTMS} disabled={$isScanning}>
                                    {$isScanning ? 'Scanning...' : 'Scan for devices'}
                                </button>
                            {/if}
                        </div>

                        {#if $availableFTMSDevices.length > 0 && !$ftmsDevice}
                            <div class="ml-4 space-y-2">
                                {#each $availableFTMSDevices as device}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">{device.name || 'Unknown Device'}</span>
                                        <button class="btn btn-outline btn-sm" onclick={() => connectFTMS(device)}>
                                            Connect
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- HR Section -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span>Heart Rate Monitor</span>
                            {#if $hrDevice}
                                <div class="flex items-center gap-2">
                                    <span class="text-sm opacity-75">{$hrDevice.name}</span>
                                    <button class="btn btn-ghost btn-sm" onclick={() => disconnectHR($hrDevice)}>
                                        Disconnect
                                    </button>
                                </div>
                            {:else}
                                <button class="btn btn-primary" onclick={scanForHR} disabled={$isScanning}>
                                    {$isScanning ? 'Scanning...' : 'Scan for devices'}
                                </button>
                            {/if}
                        </div>

                        {#if $availableHRDevices.length > 0 && !$hrDevice}
                            <div class="ml-4 space-y-2">
                                {#each $availableHRDevices as device}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">{device.name || 'Unknown Device'}</span>
                                        <button class="btn btn-outline btn-sm" onclick={() => connectHR(device)}>
                                            Connect
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- App Settings -->
        <div class="card bg-base-100 shadow">
            <div class="card-body">
                <h3 class="mb-4 card-title text-lg">App Settings</h3>
                <form onsubmit={(e) => e.preventDefault()} class="space-y-4">
                    <fieldset class="form-control">
                        <legend class="label-text mb-2">Units</legend>
                        <div class="flex gap-2">
                            <button
                                type="button"
                                class={$settings.units === 'metric' ? 'btn btn-primary' : 'btn btn-outline'}
                                onclick={() => $settings.units = 'metric'}
                            >
                                Metric (km)
                            </button>
                            <button
                                type="button"
                                class={$settings.units === 'imperial' ? 'btn btn-primary' : 'btn btn-outline'}
                                onclick={() => $settings.units = 'imperial'}
                            >
                                Imperial (mi)
                            </button>
                        </div>
                    </fieldset>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <span class="label-text">Dark mode</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={$settings.dark}
                                id="darkMode"
                            />
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <span class="label-text">Speed from FTMS is in MPH</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={$settings.speedInMph}
                                id="speedInMph"
                            />
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <span class="label-text">Keep screen on</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={$settings.keepScreenOn}
                                id="keepScreenOn"
                            />
                        </label>
                    </div>

                    <div class="form-control pt-4">
                        <button type="button" class="btn btn-ghost" onclick={resetSettings}>
                            Reset to defaults
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Developer Settings -->
        <div class="card bg-base-100 shadow">
            <div class="card-body">
                <h3 class="mb-4 card-title text-lg">Developer Settings</h3>
                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <span class="label-text">Simulation Mode</span>
                        <input
                            type="checkbox"
                            class="toggle"
                            bind:checked={$isSimulationMode}
                            id="simulationMode"
                        />
                    </label>
                </div>
            </div>
        </div>
    </div>
</div>