import {Shape} from '../primitives';
import Camera from '../camera';
import {vec4} from 'gl-matrix';

export default class RenderUtils {
    static drawFunction(
        camera: Camera,
        program: WebGLProgram,
        color: vec4 | number[],
    ): (shape: Shape, gl: WebGL2RenderingContext) => void {
        return function(shape: Shape, gl: WebGL2RenderingContext): void {
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
                staticShape.positionData.length / 3
            );
        };
    }

    static drawSkyboxFunction(
        camera: Camera,
        program: WebGLProgram
    ): (shape: Shape, gl: WebGL2RenderingContext) => void {
        return function(shape: Shape, gl: WebGL2RenderingContext): void {
            gl.depthMask(false);
            const staticShape = shape.constructor as typeof Shape;

            gl.useProgram(program);
            gl.bindVertexArray(staticShape.vao);

            // Uniforms
            const skyboxWorldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
            const skyboxViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');
            gl.uniformMatrix4fv(skyboxWorldToViewLoc, false, camera.getSkyboxWorldToView());
            gl.uniformMatrix4fv(skyboxViewToClipLoc, false, camera.projection);

            // Draw
            gl.drawArrays(
                staticShape.mode,
                0,
                staticShape.positionData.length / 3
            );
            gl.depthMask(true);
        };
    }
}