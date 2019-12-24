import Camera from './camera';
import { InputState } from './input';

export interface Updatable {
    update(deltaTime: number, input: InputState): void;
}

export interface Drawable {
    draw(gl: WebGL2RenderingContext): void;
}

export interface Renderable {
    framebuffer: WebGLFramebuffer | null;
    drawables: Drawable[];
}

export class Updater<T> implements Updatable {
    target: T;
    updateFunction: (target: T, deltaTime: number, input: InputState) => void;

    constructor(target: T, func: (target: T, deltaTime: number, input: InputState) => void) {
        this.target = target;
        this.updateFunction = func;
    }

    update(deltaTime: number, input: InputState): void {
        this.updateFunction(this.target, deltaTime, input);
    }
}

export class Drawer<T> implements Drawable {
    target: T;
    drawFunction: (gl: WebGL2RenderingContext, target: T) => void;

    constructor(target: T, func: (gl: WebGL2RenderingContext, target: T) => void) {
        this.target = target;
        this.drawFunction = func;
    }

    draw(gl: WebGL2RenderingContext): void {
        this.drawFunction(gl, this.target);
    }
}

export default class Scene {
    camera: Camera;
    updatables: Updatable[];
    renderables: Renderable[];

    constructor(
        camera: Camera,
        updatables: Updatable[],
        renderables: Renderable[],
    ) {
        this.camera = camera;
        this.updatables = updatables;
        this.renderables = renderables;
    }
}
