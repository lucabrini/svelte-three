<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { gridHelper, lineMaterial, pointMaterial } from './engine-config';
	import { defineCamera, definePlane, defineRenderer, defineScene } from './engine-utils';

	let canvasParent: HTMLElement;
	let sketchingCanvas: HTMLElement;

	let mouse = new THREE.Vector2();
	let raycaster: THREE.Raycaster;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;
	let plane: THREE.Mesh;
	let scene: THREE.Scene;

	let linePoints: THREE.Vector3[] = [];
	let lines: THREE.Line[] = [];

	function init() {
		const { clientWidth, clientHeight } = canvasParent;

		raycaster = new THREE.Raycaster();
		renderer = defineRenderer(clientWidth, clientHeight, sketchingCanvas);
		camera = defineCamera(clientWidth, clientHeight);
		scene = defineScene();
		plane = definePlane();

		scene.add(plane);
		scene.add(gridHelper);
	}

	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	function handleMouseDown(e: MouseEvent) {
		mouse.x = (e.clientX / canvasParent.clientWidth) * 2 - 1;
		mouse.y = -(e.clientY / canvasParent.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);

		const intersects = raycaster.intersectObject(plane);
		const linePoint = intersects[0].point.setZ(0).round();
		linePoints.push(linePoint);

		const pointGeometry = new THREE.BufferGeometry().setFromPoints([linePoint]);
		const pointRender = new THREE.Points(pointGeometry, pointMaterial);
		scene.add(pointRender);

		if (linePoints.length > 1) {
			const lineGeometry = new THREE.BufferGeometry().setFromPoints([
				linePoints.at(-2)!,
				linePoint
			]);
			const line = new THREE.Line(lineGeometry, lineMaterial);
			scene.add(line);
			lines.push(line);
		}
	}

	function handleMouseMove(e: MouseEvent) {}

	function handleMouseUp(e: MouseEvent) {}

	onMount(() => {
		init();
		animate();
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex-1 h-screen"
	bind:this={canvasParent}
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
>
	<canvas bind:this={sketchingCanvas} class="m-0" />
</div>
