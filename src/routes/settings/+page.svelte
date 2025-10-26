<script lang="ts">
	import { connectFtms, connectHr } from '$lib/bluetooth';
</script>

<div class="container mx-auto p-4">
	<h1 class="h1 mb-4 text-center">Settings</h1>

	<div class="flex flex-col space-y-4">
		<button class="variant-filled-primary btn" on:click={connectFtms}>Connect to FTMS</button>
		<button class="variant-filled-primary btn" on:click={connectHr}
			>Connect to Heart Rate Monitor</button
		>
	</div>
</div>
