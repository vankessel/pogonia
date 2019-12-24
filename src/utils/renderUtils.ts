import { Vec4 } from 'gl-transform';
import { Shape } from '../primitives';
import Camera from '../camera';

export default class RenderUtils {
    static drawFunction(
        camera: Camera,
        program: WebGLProgram,
        color: Vec4 | number[],
    ): (gl: WebGL2RenderingContext, shape: Shape) => void {
        return (gl: WebGL2RenderingContext, shape: Shape): void => {
            const staticShape = shape.constructor as typeof Shape;

            gl.useProgram(program);
            gl.bindVertexArray(staticShape.vao);

            // Uniforms
            const modelToWorldLoc = gl.getUniformLocation(program, 'u_modelToWorld');
            const worldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
            const ViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');
            gl.uniformMatrix4fv(modelToWorldLoc, false, shape.transform);
            gl.uniformMatrix4fv(worldToViewLoc, false, camera.getWorldToView());
            gl.uniformMatrix4fv(ViewToClipLoc, false, camera.projection);

            const colorLoc = gl.getUniformLocation(program, 'u_color');
            gl.uniform4fv(colorLoc, color);

            // Draw
            gl.drawArrays(
                staticShape.mode,
                0,
                staticShape.positionData.length / 3,
            );
        };
    }

    static drawQuadFunction(
        program: WebGLProgram,
    ): (gl: WebGL2RenderingContext, shape: Shape) => void {
        return (gl: WebGL2RenderingContext, shape: Shape): void => {
            const staticShape = shape.constructor as typeof Shape;

            gl.useProgram(program);
            gl.bindVertexArray(staticShape.vao);

            // Draw
            gl.drawArrays(
                staticShape.mode,
                0,
                staticShape.positionData.length / 3,
            );
        };
    }

    static drawSkyboxFunction(
        gl: WebGL2RenderingContext,
        camera: Camera,
        program: WebGLProgram,
    ): (gl: WebGL2RenderingContext, shape: Shape) => void {
        // TODO: Should gl.useProgram be called before? Doesn't seem like it.
        const skyboxWorldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
        const skyboxViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');

        return (gl_: WebGL2RenderingContext, shape: Shape): void => {
            gl_.depthMask(false);
            const staticShape = shape.constructor as typeof Shape;

            gl_.useProgram(program);
            gl_.bindVertexArray(staticShape.vao);

            // Uniforms
            gl_.uniformMatrix4fv(skyboxWorldToViewLoc, false, camera.getSkyboxWorldToView());
            gl_.uniformMatrix4fv(skyboxViewToClipLoc, false, camera.projection);

            // Draw
            gl_.drawArrays(
                staticShape.mode,
                0,
                staticShape.positionData.length / 3,
            );
            gl_.depthMask(true);
        };
    }
}
