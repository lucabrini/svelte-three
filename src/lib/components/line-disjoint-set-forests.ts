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

export type ForestTree = {
	representative: TreeNode;
	nodes: TreeNode[];
};

export class TraitDisjointSet {
	private _forest: ForestTree[] = [];

	// Disjoint Set Data Structure methods
	makeSet(line: Line2, startPoint: THREE.Vector3, endPoint: THREE.Vector3) {
		const representative = new TreeNode(line, startPoint, endPoint);
		this._forest.push({
			representative,
			nodes: [representative]
		});
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
		this.linkSet(this.findSet(nodeA), this.findSet(nodeB));
	}

	linkSet(nodeA: TreeNode, nodeB: TreeNode) {
		if (nodeA.rank > nodeB.rank) {
			nodeB.parent = nodeA;
			this.linkForest(nodeA, nodeB);
		} else {
			nodeA.parent = nodeB;
			this.linkForest(nodeB, nodeA);
			if (nodeA.rank === nodeB.rank) {
				nodeB.rank = nodeA.rank + 1;
			}
		}
	}

	deleteSet(node: TreeNode) {
		const representative = this.findSet(node);
		const forestIndex = this._forest.findIndex((n) => n.representative === representative);
		this._forest.splice(forestIndex, 1);
	}

	// Forest Tree Nodes methods
	makeNode(line: Line2, startPoint: THREE.Vector3, endPoint: THREE.Vector3, parent: TreeNode) {
		const node = new TreeNode(line, startPoint, endPoint, parent);

		const representative = this.findSet(parent);
		const forestIndex = this._forest.findIndex((n) => n.representative === representative);
		this._forest[forestIndex].nodes.push(node);

		return node;
	}

	findNode(line: Line2) {
		return this.nodes.find((n) => n.line === line);
	}

	deleteNode(node: TreeNode) {
		const representative = this.findSet(node);

		const forestIndex = this._forest.findIndex((n) => n.representative === representative);

		const nodeIndex = this._forest[forestIndex].nodes.indexOf(node);
		this._forest[forestIndex].nodes.splice(nodeIndex, 1);

		if (node === representative) {
			// Setting parent of those nodes who had this node as parent
			for (let i = 0; i < this._forest[forestIndex].nodes.length; i++) {
				if (this._forest[forestIndex].nodes[i].parent === node) {
					this._forest[forestIndex].nodes[i].parent = this._forest[forestIndex].nodes[1];
				}
			}

			this._forest[forestIndex].representative = this._forest[forestIndex].nodes[1];
		}
	}

	private linkForest(parent: TreeNode, node: TreeNode) {
		const treeBIndex = this._forest.findIndex((t) => t.representative === node)!;
		const treeA = this._forest.find((t) => t.representative === parent)!;
		treeA.nodes = treeA.nodes.concat(this._forest[treeBIndex].nodes);
		treeA.nodes.push(node);
		this._forest.splice(treeBIndex, 1);
	}

	get nodes() {
		let nodes: TreeNode[] = [];
		this._forest.forEach((f) => {
			nodes = nodes.concat(f.nodes);
		});

		return nodes;
	}

	toJson() {
		return this._forest;
	}

	linesLength() {
		let length = 0;
		this.nodes.forEach((n) => {
			length += n.startPoint.distanceTo(n.endPoint);
		});

		return length;
	}

	get lines() {
		return this.nodes.map((n) => n.line);
	}
}
