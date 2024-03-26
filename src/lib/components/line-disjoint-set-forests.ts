import * as THREE from 'three';

export class TreeNode {
	private _parent: TreeNode;
	private _point: THREE.Vector3;
	private _rank: number;

	constructor(point: THREE.Vector3, parent?: TreeNode) {
		this._parent = parent ?? this;
		this._point = point;
		this._rank = 0;
	}

	get parent() {
		return this._parent;
	}
	set parent(value: TreeNode) {
		this._parent = value;
	}
	get point() {
		return this._point;
	}
	set point(value: THREE.Vector3) {
		this._point = value;
	}
	get rank() {
		return this._rank;
	}
	set rank(value: number) {
		this._rank = value;
	}
}

export class PointDisjointSet {
	private _sets: object[] = [];

	makeSet(point: THREE.Vector3) {
		const representative = new TreeNode(point);
		this._sets.push(representative);
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
}
