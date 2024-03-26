import * as THREE from 'three';
import { planeMaterial, sceneBackground } from './engine-config';

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
