<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { DrawingMode, gridHelper, pointMaterial } from './engine-config';
	import {
		currentPerimeterLength,
		defineCamera,
		definePlane,
		defineRenderer,
		defineScene,
		drawLine
	} from './engine-utils';
	import { Line2 } from 'three/examples/jsm/Addons.js';

	let canvasParent: HTMLElement;
	let sketchingCanvas: HTMLElement;

	let raycaster: THREE.Raycaster;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;
	let plane: THREE.Mesh;
	let scene: THREE.Scene;

	let linePoints: THREE.Vector3[] = [];
	let startingPoint: THREE.Vector3;
	let lines: Line2[] = [];

	let temporaryLine: Line2;
	let drawing = false;

	let currentMode = DrawingMode.IDLE;

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
		const mouse = new THREE.Vector2();

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
		const line = drawLine(linePoints.at(-1)!, linePoint);

		if (temporaryLine != undefined) {
			scene.remove(temporaryLine);
		}

		scene.add(line);
		temporaryLine = line;
	}

	function handleChangeMode(newMode: DrawingMode) {
		currentMode = currentMode === newMode ? DrawingMode.IDLE : newMode;
	}

	$: {
		switch (currentMode) {
			case DrawingMode.SKETCH:
				document.body.style.cursor = 'crosshair';
				break;
			case DrawingMode.DELETE:
				document.body.style.cursor = 'crosshair';
				break;
			case DrawingMode.IDLE:
				document.body.style.cursor = 'auto';
				break;
		}
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
	<div class="fixed flex justify-center top-0 w-screen h-40 p-2">
		<div
			class="h-14 w-2/4 p-2 flex flex-row items-center space-x-2 bg-gray-700 rounded-lg shadow-lg text-white"
		>
			<button
				on:click={() => handleChangeMode(DrawingMode.SKETCH)}
				class="bg-white p-2 px-6 rounded-md text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
				>Disegna</button
			>
			<button
				on:click={() => handleChangeMode(DrawingMode.DELETE)}
				class="bg-white p-2 px-6 rounded-md text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
				>Cancella tratto</button
			>
		</div>
	</div>
</div>
