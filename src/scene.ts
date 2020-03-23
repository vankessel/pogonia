import { Camera } from './camera';
import { InputState } from './input';
import { Bipartite, OrderedPair } from './utils/structures';

/**
 * Something that can be updated.
 */
export interface Updatable {
    update(deltaTime: number, input: InputState): void;
}

/**
 * Something that can be drawn.
 */
export interface Drawable {
    draw(gl: WebGL2RenderingContext): void;
}

/**
 * Class that updates a target object with a particular function.
 *
 * If you had two sets, one of objects of type T, one of functions taking type T each instance of this class represents
 * a particular mapping from object to function of a
 * [non-injective](https://en.wikipedia.org/wiki/Bijection,_injection_and_surjection) map.
 *
 * This is why target is a single instance rather than a collection.
 */
export class Updater<T> extends OrderedPair<T, (a: T, deltaTime: number, b: InputState) => void> implements Updatable {
    get target(): T {
        return this.left;
    }

    get updateFunction(): (target: T, deltaTime: number, input: InputState) => void {
        return this.right;
    }

    // eslint-disable-next-line no-useless-constructor
    constructor(target: T, updateFunc: (target: T, deltaTime: number, input: InputState) => void) {
        super(target, updateFunc);
    }

    update(deltaTime: number, input: InputState): void {
        this.right(this.left, deltaTime, input);
    }
}

/**
 * Class that draws a target object with a particular function
 */
export class Drawer<T> extends OrderedPair<T, (gl: WebGL2RenderingContext, target: T) => void> implements Drawable {
    get target(): T {
        return this.left;
    }

    get drawFunction(): (gl: WebGL2RenderingContext, target: T) => void {
        return this.right;
    }

    // eslint-disable-next-line no-useless-constructor
    constructor(target: T, drawFunction: (gl: WebGL2RenderingContext, target: T) => void) {
        super(target, drawFunction);
    }

    draw(gl: WebGL2RenderingContext): void {
        this.drawFunction(gl, this.target);
    }
}

/**
 * What will be rendered to. Different render targets can use the same framebuffer.
 */
export class RenderTarget {
    framebuffer: WebGLFramebuffer | null;

    constructor(framebuffer: WebGLFramebuffer | null) {
        this.framebuffer = framebuffer;
    }
}

/**
 * The most atomic render that can be performed is between a drawable object and a render target.
 */
export type Renderable = OrderedPair<RenderTarget, Drawable>;

/**
 * A sequence of RenderTargets and associated Renderables that will be drawn.
 * The color and depth buffers are cleared between each new RenderTarget.
 */
export class SequencedRenderer extends Bipartite<RenderTarget, Drawable> implements Drawable {
    get renderTargets(): RenderTarget[] {
        return this._renderTargets.slice();
    }

    get drawables(): Set<Drawable> {
        return this.right;
    }

    private readonly _renderTargets: RenderTarget[];

    constructor(
        renderTargets: RenderTarget[],
        edges?: Iterable<Renderable>,
        drawables?: Iterable<Drawable>,
    ) {
        super(edges, renderTargets, drawables);
        this._renderTargets = renderTargets;
    }

    /**
     * Generates a set of Renderables, one for each drawable. From the render target to that drawable.
     * @param renderTarget The render target for the drawables.
     * @param drawables The drawables to be rendered to the render target.
     */
    static genRenderables(renderTarget: RenderTarget, drawables: Iterable<Drawable>): Renderable[] {
        return [...drawables].map<Renderable>(
            (drawable) => new OrderedPair(renderTarget, drawable),
        );
    }

    addRenderables(renderables: Iterable<Renderable>): SequencedRenderer {
        for (const renderable of renderables) {
            this.addEdge(renderable);
        }
        return this;
    }

    genAndAddRenderables(renderTarget: RenderTarget, drawables: Iterable<Drawable>): SequencedRenderer {
        return this.addRenderables(SequencedRenderer.genRenderables(renderTarget, drawables));
    }

    draw(gl: WebGL2RenderingContext): void {
        for (const renderTarget of this._renderTargets) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.framebuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const edges = this.edgesOfLeftNode(renderTarget) || [];
            for (const edge of edges) {
                edge.right.draw(gl);
            }
        }
    }
}

/**
 * A scene has an active camera and contains things that can be updated or drawn.
 */
export class Scene implements Updatable, Drawable {
    camera: Camera;
    updatables: Updatable[];
    drawables: Drawable[];

    constructor(
        camera: Camera,
        updatables: Updatable[],
        drawables: Drawable[],
    ) {
        this.camera = camera;
        this.updatables = updatables;
        this.drawables = drawables;
    }

    update(deltaTime: number, input: InputState): void {
        for (const updatable of this.updatables) {
            updatable.update(deltaTime, input);
        }
    }

    draw(gl: WebGL2RenderingContext): void {
        for (const drawable of this.drawables) {
            drawable.draw(gl);
        }
    }
}
