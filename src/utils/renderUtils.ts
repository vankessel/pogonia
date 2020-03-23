import { Vec4 } from 'gl-transform';
import { Shape } from '../primitives';
import { Camera } from '../camera';

// TODO: This all needs to be replaced.
//       Each render function redundantly prepares shader state.
//       Replace with method of drawing objects in order of:
//       shader > texture > something else I'm tired and continuing this later.
export function drawFunction(
    gl: WebGL2RenderingContext,
    camera: Camera,
    program: WebGLProgram,
    color: Vec4 | number[],
): (gl: WebGL2RenderingContext, shape: Shape) => void {

    const modelToWorldLoc = gl.getUniformLocation(program, 'u_modelToWorld');
    const worldToViewLoc = gl.getUniformLocation(program, 'u_worldToView');
    const ViewToClipLoc = gl.getUniformLocation(program, 'u_viewToClip');
    const colorLoc = gl.getUniformLocation(program, 'u_color');

    return (gl_: WebGL2RenderingContext, shape: Shape): void => {
        const staticShape = shape.constructor as typeof Shape;

        // TODO: Is this idempotent? Does only actually changing state affect performance?
        gl_.useProgram(program);
        gl_.bindVertexArray(staticShape.vao);

        // Uniforms
        gl_.uniformMatrix4fv(modelToWorldLoc, false, shape.transform);
        gl_.uniformMatrix4fv(worldToViewLoc, false, camera.getWorldToView());
        gl_.uniformMatrix4fv(ViewToClipLoc, false, camera.projection);
        gl_.uniform4fv(colorLoc, color);

        // Draw
        gl_.drawArrays(
            staticShape.mode,
            0,
            staticShape.positionData.length / 3,
        );
    };
}

export function drawQuadFunction(
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

export function drawSkyboxFunction(
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
