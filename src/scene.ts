import Camera from './camera';
import {Shape} from './primitives';

interface Drawable {
    program: WebGLProgram;
    shape: Shape;
}

export default class Scene {
    activeCamera: Camera;
    cameras: Camera[];
    drawables: Drawable[];

    constructor(camera: Camera, drawables?: Drawable[]) {
        this.activeCamera = camera;
        this.cameras = [camera];
        this.drawables = drawables ? drawables : [];
    }

    getCamera(idx: number): Camera {
        return this.cameras[idx];
    }

    addCamera(camera: Camera): void {
        this.cameras.push(camera);
    }

    addCameras(cameras: Camera[]): void {
        this.cameras.concat(cameras)
    }

    addDrawable(drawable: Drawable): void {
        this.drawables.push(drawable);
    }

    addDrawables(drawables: Drawable[]): void {
        this.drawables.concat(drawables);
    }
}