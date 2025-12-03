<script lang="ts">
	import { onMount } from 'svelte';
	import { rides, loadRides, deleteRide, type Ride } from '$lib/rides-store';

	onMount(async () => {
		await loadRides();
	});

	async function downloadRide(ride: Ride) {
		const blob = new Blob([ride.data], { type: 'application/vnd.garmin.fit' });
		const fileName = `${ride.name}.fit`;
		const file = new File([blob], fileName, { type: 'application/vnd.garmin.fit' });

		if (navigator.share && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({
					files: [file],
					title: ride.name,
					text: 'Download your ride data.'
				});
				return;
			} catch (error) {
				console.error('Sharing failed:', error);
				// Fallback to download link if sharing fails
			}
		}

		// Fallback for browsers that don't support sharing or if sharing fails
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function handleDelete(ride: Ride) {
		if (ride.id && confirm('Are you sure you want to delete this ride?')) {
			await deleteRide(ride.id);
			await loadRides();
		}
	}
</script>

<div class="p-6">
	<h2 class="mb-4 text-xl font-semibold">Rides</h2>

	{#if $rides.length === 0}
		<p class="text-muted text-sm">No recorded rides yet.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>Name</th>
						<th>Date</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $rides as ride (ride.id)}
						<tr>
							<td>{ride.name}</td>
							<td>{ride.date.toLocaleString()}</td>
							<td>
								<div class="flex gap-2">
									<button on:click={() => downloadRide(ride)} class="btn btn-sm btn-primary"
										>Download</button
									>
									<button on:click={() => handleDelete(ride)} class="btn btn-sm btn-error"
										>Delete</button
									>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
