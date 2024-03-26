import type { Line2 } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
export class TreeNode {
	parent: TreeNode;
	line: Line2;
	rank: number;
	startPoint: THREE.Vector3;
	endPoint: THREE.Vector3;

	constructor(line: Line2, startPoint: THREE.Vector3, endPoint: THREE.Vector3, parent?: TreeNode) {
		this.parent = parent ?? this;
		this.line = line;
		this.rank = 0;
		this.startPoint = startPoint;
		this.endPoint = endPoint;
	}
}

export class TraitDisjointSet {
	private _nodes: TreeNode[] = [];

	makeNode(line: Line2, startPoint: THREE.Vector3, endPoint: THREE.Vector3, parent: TreeNode) {
		const node = new TreeNode(line, startPoint, endPoint, parent);
		this._nodes.push(node);

		return node;
	}

	findNode(line: Line2) {
		return this._nodes.find((n) => n.line === line);
	}

	makeSet(line: Line2, startPoint: THREE.Vector3, endPoint: THREE.Vector3) {
		const representative = new TreeNode(line, startPoint, endPoint);
		this._nodes.push(representative);
		return representative;
	}

	findSet(node: TreeNode): TreeNode {
		if (node.parent === node) {
			return node;
		} else {
			return this.findSet(node.parent);
		}
	}

	unionSet(nodeA: TreeNode, nodeB: TreeNode) {
		this.link(this.findSet(nodeA), this.findSet(nodeB));
	}

	link(nodeA: TreeNode, nodeB: TreeNode) {
		if (nodeA.rank > nodeB.rank) {
			nodeB.parent = nodeA;
		} else {
			nodeA.parent = nodeB;
			if (nodeA.rank === nodeB.rank) {
				nodeB.rank = nodeA.rank + 1;
			}
		}
	}

	linesLength() {
		let length = 0;
		this._nodes.forEach((n) => {
			length += n.startPoint.distanceTo(n.endPoint);
		});

		return length;
	}

	get nodes() {
		return this._nodes;
	}

	get lines() {
		return this._nodes.map((n) => n.line);
	}
}
