import Camera from './camera';
import { InputState } from './input';

export interface Updatable {
    update(deltaTime: number, input: InputState): void;
}

export interface Drawable {
    draw(gl: WebGL2RenderingContext): void;
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
    drawFunction: (target: T, gl: WebGL2RenderingContext) => void;

    constructor(target: T, func: (target: T, gl: WebGL2RenderingContext) => void) {
        this.target = target;
        this.drawFunction = func;
    }

    draw(gl: WebGL2RenderingContext): void {
        this.drawFunction(this.target, gl);
    }
}

export default class Scene {
    camera: Camera;
    updatables: Updatable[];
    drawables: Drawable[];
    quad: Drawable | null;
    fb1: WebGLFramebuffer | null;
    fb2: WebGLFramebuffer | null;

    constructor(
        camera: Camera,
        updatables: Updatable[] = [],
        drawables: Drawable[] = [],
        quad: Drawable | null = null,
        fb1: WebGLFramebuffer | null = null,
        fb2: WebGLFramebuffer | null = null,
    ) {
        this.camera = camera;
        this.updatables = updatables;
        this.drawables = drawables;
        this.quad = quad;
        this.fb1 = fb1;
        this.fb2 = fb2;
    }
}
