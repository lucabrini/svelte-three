<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { DrawingMode, gridHelper, pointMaterial } from './engine-config';
	import { defineCamera, definePlane, defineRenderer, defineScene, drawLine } from './engine-utils';
	import { Line2 } from 'three/examples/jsm/Addons.js';
	import { TraitDisjointSet, TreeNode } from './line-disjoint-set-forests';
	import type { ChangeEventHandler } from 'svelte/elements';

	let canvasParent: HTMLElement;
	let sketchingCanvas: HTMLElement;

	let raycaster: THREE.Raycaster;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;
	let plane: THREE.Mesh;
	let scene: THREE.Scene;

	let traitDisjointSet = new TraitDisjointSet();
	let totalLength = 0;

	let startPoint: THREE.Vector3;
	let startParentNode: TreeNode | null = null;

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
		const touchedPoint = intersects[0].point.setZ(0).round();

		return { touchedPoint, mouse };
	}

	function handleMouseDown(e: MouseEvent) {
		switch (currentMode) {
			case DrawingMode.SKETCH:
				draw(e);
				break;
			case DrawingMode.DELETE:
				deleteLine(e);
				break;
		}
	}

	function deleteLine({ clientX, clientY }: MouseEvent) {
		const { mouse } = mouseToPoint(clientX, clientY);
		raycaster.setFromCamera(mouse, camera);
		const intersections = raycaster.intersectObjects(traitDisjointSet.lines);

		scene.remove(intersections[0].object);

		const lineNode = traitDisjointSet.findNode(intersections[0].object as Line2)!;
		traitDisjointSet.deleteNode(lineNode);

		console.log(traitDisjointSet.toJson());
	}

	function draw({ clientX, clientY }: MouseEvent) {
		const { touchedPoint, mouse } = mouseToPoint(clientX, clientY);

		raycaster.setFromCamera(mouse, camera);
		const intersections = raycaster.intersectObjects(traitDisjointSet.lines);
		console.log(intersections.length)

		if (drawing) {
			drawing = false;
			const line = drawLine(startPoint, touchedPoint);
			scene.add(line);

			// If line A has started on a pre-existing line B, make a node in the
			// line B's forest and if line A has finished on another pre-existing
			// line C, merge line C's and line B's forest
			if (startParentNode !== null) {
				traitDisjointSet.makeNode(line, startPoint, touchedPoint, startParentNode);
				if (intersections.length !== 0) {
					const endParentNode = traitDisjointSet.findNode(intersections[0].object as Line2)!;
					traitDisjointSet.unionSet(startParentNode, endParentNode);
				}
				startParentNode = null;
			} else {
				const newNode = traitDisjointSet.makeSet(line, startPoint, touchedPoint);
				if (intersections.length !== 0) {
					const endParentNode = traitDisjointSet.findNode(intersections[0].object as Line2)!;
					traitDisjointSet.unionSet(newNode, endParentNode);
				}
			}
			console.log(traitDisjointSet.toJson());
			totalLength = Math.round(traitDisjointSet.linesLength() * 100) / 100;
		} else {
			drawing = true;
			startPoint = touchedPoint;
			if (intersections.length !== 0) {
				startParentNode = traitDisjointSet.findNode(intersections[0].object as Line2)!;
			}
		}

		/* const pointGeometry = new THREE.BufferGeometry().setFromPoints([touchedPoint]);
		const pointRender = new THREE.Points(pointGeometry, pointMaterial);
		scene.add(pointRender); */
	}

	function handleMouseMove(e: MouseEvent) {
		const { touchedPoint } = mouseToPoint(e.clientX, e.clientY);
		if (drawing) {
			drawTemporaryLine(touchedPoint);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			drawing = false;
			scene.remove(temporaryLine);

			//currentMode = DrawingMode.IDLE
		}
	}

	function drawTemporaryLine(linePoint: THREE.Vector3) {
		const line = drawLine(startPoint, linePoint);

		if (temporaryLine != undefined) {
			scene.remove(temporaryLine);
		}

		scene.add(line);
		temporaryLine = line;
	}

	const handleModeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		currentMode = parseInt(e.currentTarget.value);
	};

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
			class="h-14 w-2/4 p-2 flex flex-row items-center justify-between space-x-2 bg-gray-700 rounded-lg shadow-lg text-white"
		>
			<div class="flex flex-col">
				<span class="font-bold">Modalità:</span>
				<form class="text-sm">
					<input
						id="drawing-mode-draw-btn"
						type="radio"
						value={DrawingMode.SKETCH}
						name="drawing-mode"
						checked={currentMode === DrawingMode.SKETCH}
						on:change={handleModeChange}
					/>
					<label for="drawing-mode-draw-btn">Disegna</label>
					<input
						id="drawing-mode-delete-btn"
						type="radio"
						value={DrawingMode.DELETE}
						checked={currentMode === DrawingMode.DELETE}
						name="drawing-mode"
						on:click={handleModeChange}
					/>
					<label for="drawing-mode-delete-btn">Cancella</label>
					<input
						id="drawing-mode-idle-btn"
						type="radio"
						value={DrawingMode.IDLE}
						checked={currentMode === DrawingMode.IDLE}
						name="drawing-mode"
						on:click={handleModeChange}
					/>
					<label for="drawing-mode-idle-btn">Idle</label>
				</form>
			</div>
			<p>Lunghezza totale: <span class="w-14">{totalLength}</span></p>
		</div>
	</div>
</div>
