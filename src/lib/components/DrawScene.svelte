<script lang="ts">
	export let points: THREE.Vector3[] = [];

	import { T, useThrelte } from '@threlte/core';
	import { Grid } from '@threlte/extras';
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	const { renderer, scene } = useThrelte();

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene.background = new THREE.Color('#ffffff');

	onMount(() => {
		console.log(points);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineDashedMaterial({ color: 0x000000 });
		const line = new THREE.Line(geometry, material);

		scene.add(line);
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, 50]}
	on:create={({ ref }) => ref.lookAt(0, 0, 0)}
	fov={45}
	aspect={window.innerWidth / window.innerHeight}
	near={1}
	far={500}
/>

<Grid
	axis="z"
	gridSize={[400, 400]}
	plane="xy"
	sectionSize={50}
	cellColor={'#d2d2d2'}
	sectionThickness={0}
>
	<T.BoxGeometry args={[50, 50, 0]} />
</Grid>
