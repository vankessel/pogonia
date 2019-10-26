import {Shape} from './primitives';
import Camera from './camera';

export default class Renderer {
    static draw(gl: WebGL2RenderingContext, camera: Camera, shape: Shape, program: WebGLProgram): void {
        const staticShape = shape.constructor as typeof Shape;
        staticShape.initVao(gl);

        gl.useProgram(program);
        gl.bindVertexArray(staticShape.vao);

        // Uniforms
        const modelToWorldLoc = gl.getUniformLocation(program, 'u_modelToWorld');
        const worldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
        const ViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');
        gl.uniformMatrix4fv(modelToWorldLoc, false, shape.transform);
        gl.uniformMatrix4fv(worldToViewLoc, false, camera.getWorldToView());
        gl.uniformMatrix4fv(ViewToClipLoc, false, camera.projection);

        // Draw
        gl.drawElements(
            staticShape.mode,
            staticShape.indexArray.length,
            gl.UNSIGNED_SHORT,
            0
        );
    }

    static drawSkybox(gl: WebGL2RenderingContext, camera: Camera, shape: Shape, program: WebGLProgram): void {
        gl.depthMask(false);
        const staticShape = shape.constructor as typeof Shape;
        staticShape.initVao(gl);

        gl.useProgram(program);
        gl.bindVertexArray(staticShape.vao);

        // Uniforms
        const skyboxWorldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
        const skyboxViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');
        gl.uniformMatrix4fv(skyboxWorldToViewLoc, false, camera.getSkyboxWorldToView());
        gl.uniformMatrix4fv(skyboxViewToClipLoc, false, camera.projection);

        // Draw
        gl.drawElements(
            staticShape.mode,
            staticShape.indexArray.length,
            gl.UNSIGNED_SHORT,
            0
        );
        gl.depthMask(true);
    }
}