import { Mat4, Vec3 } from 'gl-transform';
import { Rigid } from './primitives';
import { Updater } from './scene';
import { InputState } from './input';
import { getViewportInfo } from './utils/glUtils';

export default class Camera extends Rigid {
    pitch = 0.0;
    yaw = 0.0;

    readonly xFov: number;
    readonly aspect: number;
    readonly near: number;
    readonly far: number;
    readonly projection: Mat4;

    private transformMemoizedValue: Mat4;
    private inverseTransformMemoizedValue: Mat4;

    constructor(gl: WebGL2RenderingContext, xFov: number, aspect: number, near: number, far: number) {
        super(gl);
        this.xFov = xFov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projection = Mat4.perspectiveMatrix(xFov, aspect, near, far);
        this.transformMemoizedValue = Mat4.clone(this.transform);
        this.inverseTransformMemoizedValue = this.getInverseTransform();
    }

    getDirection(): Vec3 {
        return this.getBackward();
    }

    getWorldToView(): Mat4 {
        if (!Mat4.equals(this.transform, this.transformMemoizedValue)) {
            this.transformMemoizedValue = Mat4.clone(this.transform);
            this.inverseTransformMemoizedValue = this.getInverseTransform();
        }
        return Mat4.clone(this.inverseTransformMemoizedValue);
    }

    getSkyboxWorldToView(): Mat4 {
        const untranslated = this.getWorldToView();
        untranslated[12] = 0;
        untranslated[13] = 0;
        untranslated[14] = 0;
        return untranslated;
    }
}

export function initStandardCameraController(gl: WebGL2RenderingContext, camera: Camera): Updater<Camera> {
    const viewportInfo = getViewportInfo(gl);
    const xFovPerPixel = camera.xFov / viewportInfo.width;
    const yFovPerPixel = camera.xFov / (camera.aspect * viewportInfo.height);
    const sensitivity = 2;
    return new Updater(camera, (cameraToUpdate: Camera, deltaTime: number, input: InputState): void => {
        if (input.mouse.pressed && input.mouse.button === 0) {
            cameraToUpdate.yaw   -= input.mouse.movement.x * xFovPerPixel * sensitivity;
            cameraToUpdate.pitch -= input.mouse.movement.y * yFovPerPixel * sensitivity;
            // Bound yaw
            if (cameraToUpdate.yaw > Math.PI) {
                cameraToUpdate.yaw -= 2 * Math.PI;
            } else if (cameraToUpdate.yaw <= -Math.PI) {
                cameraToUpdate.yaw += 2 * Math.PI;
            }
            // Clamp pitch
            if (cameraToUpdate.pitch > Math.PI / 2) {
                cameraToUpdate.pitch = Math.PI / 2;
            } else if (cameraToUpdate.pitch < -Math.PI / 2) {
                cameraToUpdate.pitch = -Math.PI / 2;
            }
            const tx = cameraToUpdate.transform[12];
            const ty = cameraToUpdate.transform[13];
            const tz = cameraToUpdate.transform[14];
            cameraToUpdate.transform = Mat4.multiply(
                Mat4.rotationYMatrix(cameraToUpdate.yaw),
                Mat4.rotationXMatrix(cameraToUpdate.pitch),
            );
            cameraToUpdate.transform[12] = tx;
            cameraToUpdate.transform[13] = ty;
            cameraToUpdate.transform[14] = tz;
        }

        if (input.keys.w) {
            cameraToUpdate.translate(0, 0, -deltaTime);
        }
        if (input.keys.a) {
            cameraToUpdate.translate(-deltaTime, 0, 0);
        }
        if (input.keys.s) {
            cameraToUpdate.translate(0, 0, deltaTime);
        }
        if (input.keys.d) {
            cameraToUpdate.translate(deltaTime, 0, 0);
        }
    });
}
