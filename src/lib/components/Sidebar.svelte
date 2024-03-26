<script lang="ts">
	import { page } from '$app/stores';

	export let open = true;

	function isCurrentPage(label: string) {
    console.log(label, $page.url.pathname)
		return $page.url.pathname == label;
	}

	const routes = [
		{
			label: 'Home',
			path: '/'
		},
		{
			label: 'Preventivo',
			path: '/preventivo'
		}
	];
</script>

<div>
{#if open}
	<div class={'float-left h-screen bg-gray-200 p-4 w-1/6'}>
		<h2 class="font-bold text-lg">Menu di prova</h2>
		<nav class="flex flex-col mt-4 space-y-1">
			{#each routes as r}
				<a href={r.path} class={isCurrentPage(r.path) ? "bg-red-500" : ""}>{r.label}</a>
			{/each}
		</nav>
	</div>
{/if}
<button class="border-1 p-2 bg-red-300 hover:bg-red-500 m-2" on:click={(_) => (open = !open)}
	>Apri menu</button
>
</div>