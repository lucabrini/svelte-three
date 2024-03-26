import * as THREE from 'three';
import { planeMaterial, sceneBackground, shaderLineMaterial } from './engine-config';
import { LineGeometry, Line2 } from 'three/examples/jsm/Addons.js';

export function defineRenderer(width: number, height: number, canvas: HTMLElement) {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setSize(width, height);

	return renderer;
}

export function defineScene() {
	const scene = new THREE.Scene();
	scene.background = sceneBackground;

	return scene;
}

export function defineCamera(width: number, heigth: number) {
	const camera = new THREE.PerspectiveCamera(45, width / heigth, 1, 500);
	camera.position.set(0, 0, 50);
	camera.lookAt(0, 0, 0);

	return camera;
}

export function definePlane() {
	const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);

	return plane;
}

export function drawLine(
	pointA: THREE.Vector3,
	pointB: THREE.Vector3,
	color = new THREE.Color(0x000000)
) {
	const positions = [...pointA.toArray(), ...pointB.toArray()];

	const lineGeometry = new LineGeometry()
		.setPositions(positions)
		.setColors([...color.toArray(), ...color.toArray()]);

	const line = new Line2(lineGeometry, shaderLineMaterial);
	line.scale.set(1, 1, 1);
	return line;
}

export function currentPerimeterLength(linePoints: THREE.Vector3[]) {
	let distance = 0;
	for (let i = 0; i < linePoints.length - 1; i++) {
		distance += linePoints[i].distanceTo(linePoints[i + 1]);
	}
	return Math.round((distance + Number.EPSILON) * 100) / 100;
}
