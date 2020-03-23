import { Mat4, Vec3 } from 'gl-transform';
import { Rigid } from './primitives';

export class Camera extends Rigid {
    pitch = 0.0;
    yaw = 0.0;

    readonly xFov: number;
    readonly aspect: number;
    readonly near: number;
    readonly far: number;
    readonly projection: Mat4;

    // Memoize the inverse transform to prevent expensive inversions.
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

    /**
     * Returns the direction the camera is pointing.
     */
    getDirection(): Vec3 {
        return this.getForward();
    }

    /**
     * Returns the camera's world to view matrix.
     * The matrix that would transform the camera to the origin and point it down the -z axis.
     */
    getWorldToView(): Mat4 {
        if (!Mat4.equals(this.transform, this.transformMemoizedValue)) {
            this.transformMemoizedValue = Mat4.clone(this.transform);
            this.inverseTransformMemoizedValue = this.getInverseTransform();
        }
        return Mat4.clone(this.inverseTransformMemoizedValue);
    }

    /**
     * Returns a world to view matrix as if the camera were positioned at the origin.
     * This is useful for skyboxes as we do not want them affected by parallax of movement.
     */
    getSkyboxWorldToView(): Mat4 {
        const untranslated = this.getWorldToView();
        untranslated[12] = 0;
        untranslated[13] = 0;
        untranslated[14] = 0;
        return untranslated;
    }
}
