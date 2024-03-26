import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export const pointMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0x000000 });
export const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
export const sceneBackground = new THREE.Color('#ffffff');
export const planeMaterial = new THREE.MeshBasicMaterial({ visible: false, color: '#ff0000' });
export const gridHelper = new THREE.GridHelper(50, 50, '#dfdfdf', '#dfdfdf').rotateX(Math.PI * 0.5);

export const shaderLineMaterial = new LineMaterial({
	color: 0xffffff,
	linewidth: 0.003, // in world units with size attenuation, pixels otherwise
	vertexColors: true,
	dashed: false,
	alphaToCoverage: true
});


export enum DrawingMode {
	SKETCH,
	DELETE,
	IDLE
}