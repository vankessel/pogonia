// TODO: Consider separating this out into a different library.

export class OrderedPair<L, R> {
    get left(): L {
        return this._left;
    }

    get right(): R {
        return this._right;
    }

    private readonly _left: L;
    private readonly _right: R;

    constructor(left: L, right: R) {
        this._left = left;
        this._right = right;
    }
}

/**
 * A bipartite graph between two sets of L and R.
 */
export class Bipartite<L extends object, R extends object> extends OrderedPair<Set<L>, Set<R>> {
    /**
     * Returns left set by cloning. Client code should not modify underlying collection directly.
     * This could result in an invalid bipartite graph.
     */
    get left(): Set<L> {
        return new Set(super.left);
    }

    /**
     * Returns right set by cloning. Client code should not modify underlying collection directly.
     * This could result in an invalid bipartite graph.
     */
    get right(): Set<R> {
        return new Set(super.right);
    }

    /**
     * Returns edges set by cloning. Client code should not modify underlying collection directly.
     * This could result in an invalid bipartite graph.
     */
    get edges(): Set<OrderedPair<L, R>> {
        return new Set(this._edges);
    }

    private readonly _edges: Set<OrderedPair<L, R>>;

    // These can be a WeakMap since nodes will be owned by edges and the left and right sets.
    // Iteration can be done on the left and right sets if needed.
    private leftNodeToEdgesMap: WeakMap<L, Set<OrderedPair<L, R>>>;
    private rightNodeToEdgesMap: WeakMap<R, Set<OrderedPair<L, R>>>;

    constructor(edges: Iterable<OrderedPair<L, R>> = [], left: Iterable<L> = [], right: Iterable<R> = []) {
        super(new Set(left), new Set(right));

        this._edges = new Set<OrderedPair<L, R>>(edges);
        this.leftNodeToEdgesMap = new Map<L, Set<OrderedPair<L, R>>>();
        this.rightNodeToEdgesMap = new Map<R, Set<OrderedPair<L, R>>>();

        for (const edge of this._edges) {
            this.addEdge(edge);
        }

        for (const node of left) {
            this.addLeftNode(node);
        }

        for (const node of right) {
            this.addRightNode(node);
        }
    }

    /**
     * Adds an edge from L to R in the Bipartite<L, R> graph.
     * Adds L to left and R to right, and updates maps.
     * @param edge
     */
    addEdge(edge: OrderedPair<L, R>): Bipartite<L, R> {
        this._edges.add(edge);

        this.addLeftNode(edge.left);
        this.addRightNode(edge.right);

        const leftNodeEdges = this.leftNodeToEdgesMap.get(edge.left);
        if (leftNodeEdges) {
            this.leftNodeToEdgesMap.set(edge.left, leftNodeEdges.add(edge));
        } else {
            this.leftNodeToEdgesMap.set(edge.left, new Set([edge]));
        }

        const rightNodeEdges = this.rightNodeToEdgesMap.get(edge.right);
        if (rightNodeEdges) {
            this.rightNodeToEdgesMap.set(edge.right, rightNodeEdges.add(edge));
        } else {
            this.rightNodeToEdgesMap.set(edge.right, new Set([edge]));
        }

        return this;
    }

    /**
     * Adds a node to the left set.
     * @param node
     */
    addLeftNode(node: L): Bipartite<L, R> {
        super.left.add(node);

        if (!this.leftNodeToEdgesMap.has(node)) {
            this.leftNodeToEdgesMap.set(node, new Set());
        }

        return this;
    }

    /**
     * Adds a node to the right set.
     * @param node
     */
    addRightNode(node: R): Bipartite<L, R> {
        super.right.add(node);

        if (!this.rightNodeToEdgesMap.has(node)) {
            this.rightNodeToEdgesMap.set(node, new Set());
        }

        return this;
    }

    /**
     * Returns set of all edges of a left node. Empty set if the node has no edges. Null if the node is non in the set.
     * @param node
     */
    edgesOfLeftNode(node: L): Set<OrderedPair<L, R>> | null {
        return this.leftNodeToEdgesMap.get(node) || null;
    }


    /**
     * Returns set of all edges of a right node. Empty set if the node has no edges. Null if the node is non in the set.
     * @param node
     */
    edgesOfRightNode(node: R): Set<OrderedPair<L, R>> | null {
        return this.rightNodeToEdgesMap.get(node) || null;
    }
}
