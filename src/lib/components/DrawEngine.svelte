<script lang="ts">
	import { Vector3 } from 'three';
	import DrawScene from './DrawScene.svelte';
	import { Canvas } from '@threlte/core';

	let points: Vector3[] = [
		new Vector3(-10, 0, 0),
		new Vector3(0, 10, 0),
		new Vector3(10, 0, 0),
		new Vector3(0, -10, 0),
		new Vector3(-10, 0, 0),

	];
</script>

<Canvas>
	<DrawScene {points} />
</Canvas>
