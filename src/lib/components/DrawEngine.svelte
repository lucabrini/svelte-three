<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { gridHelper, lineMaterial, pointMaterial, shaderLineMaterial } from './engine-config';
	import { defineCamera, definePlane, defineRenderer, defineScene, drawLine } from './engine-utils';
	import { Line2, LineGeometry } from 'three/examples/jsm/Addons.js';

	let canvasParent: HTMLElement;
	let sketchingCanvas: HTMLElement;

	let mouse = new THREE.Vector2();
	let raycaster: THREE.Raycaster;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;
	let plane: THREE.Mesh;
	let scene: THREE.Scene;

	let linePoints: THREE.Vector3[] = [];
	let lines: Line2[] = [];

	let temporaryLine: Line2;
	let drawing = false;

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

	function mouseToPoint(clientX: number, clientY: number) {
		mouse.x = (clientX / canvasParent.clientWidth) * 2 - 1;
		mouse.y = -(clientY / canvasParent.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);

		const intersects = raycaster.intersectObject(plane);
		const linePoint = intersects[0].point.setZ(0).round();

		return linePoint;
	}

	function handleMouseDown(e: MouseEvent) {
		drawing = true;

		const linePoint = mouseToPoint(e.clientX, e.clientY);
		linePoints = [...linePoints, linePoint];

		const pointGeometry = new THREE.BufferGeometry().setFromPoints([linePoint]);
		const pointRender = new THREE.Points(pointGeometry, pointMaterial);
		scene.add(pointRender);

		if (linePoints.length > 1) {
			const line = drawLine(linePoints.at(-2)!, linePoint);
			scene.add(line);
			lines.push(line);
		}
	}

	function handleMouseMove(e: MouseEvent) {
		const linePoint = mouseToPoint(e.clientX, e.clientY);
		if (drawing && linePoints.length > 0) {
			drawTemporaryLine(linePoint);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			drawing = false;
			scene.remove(temporaryLine);
		}
	}

	function drawTemporaryLine(linePoint: THREE.Vector3) {
		// Drawing temporary line

		const line = drawLine(linePoints.at(-1)!, linePoint);

		if (temporaryLine != undefined) {
			scene.remove(temporaryLine);
		}
		scene.add(line);
		temporaryLine = line;
	}

	function currentPerimeterLength() {
		let distance = 0;
		for (let i = 0; i < linePoints.length - 1; i++) {
			distance += linePoints[i].distanceTo(linePoints[i + 1]);
		}
		return Math.round((distance + Number.EPSILON) * 100) / 100;
	}

	onMount(() => {
		init();
		animate();

		document.addEventListener('keydown', handleKeyDown);
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex-1 h-screen"
	bind:this={canvasParent}
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:keypress={handleKeyDown}
>
	<canvas bind:this={sketchingCanvas} class="m-0" />
	<div class="fixed top-0 right-0 w-60 h-40 m-2 p-2 rounded-lg bg-red-400 opacity-70">
		{#key linePoints}
			<p>Lunghezza percorso: {currentPerimeterLength()}</p>
		{/key}
	</div>
</div>
