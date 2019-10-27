export function createVao(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    if (!vao) {
        throw "Could not create vertex array object.";
    }
    return vao;
}

export function createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (!buffer) {
        throw "Could not create positionBuffer.";
    }
    return buffer;
}

export function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const texture = gl.createTexture();
    if (!texture) {
        throw "Could not create texture.";
    }
    return texture;
}

export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw "Could not create shader.";
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw "Could not create shader.";
    }
    return shader;
}

export function createProgramFromShaders(gl: WebGL2RenderingContext, vertexShader: WebGLShader, frgmntShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
        throw "Could not create program.";
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw "Could not create program.";
    }
    return program;
}

export function createProgramFromSource(gl: WebGL2RenderingContext, vertexShaderSource: string, frgmntShaderSource: string): WebGLProgram {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const frgmntShader = createShader(gl, gl.FRAGMENT_SHADER, frgmntShaderSource);
    const program = gl.createProgram();
    if (!program) {
        throw "Could not create program.";
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw "Could not link program.";
    }
    return program;
}

export interface ViewportInfo {
    bounds: {
        left: number;
        bottom: number;
        right: number;
        top: number;
    };
    width: number;
    height: number;
}

export function getViewportInfo(gl: WebGL2RenderingContext): ViewportInfo {
    const viewportParams = gl.getParameter(gl.VIEWPORT);
    return {
        bounds: {
            left: viewportParams[0],
            bottom: viewportParams[1],
            right: viewportParams[2],
            top: viewportParams[3],
        },
        width: viewportParams[2] - viewportParams[0],
        height: viewportParams[3] - viewportParams[1]
    };
}

export function resizeCanvas(gl: WebGL2RenderingContext): void {
    // Lookup the size the browser is displaying the canvas.
    const canvas = gl.canvas as HTMLCanvasElement;

    // Check if the canvas is not the same size.
    if (canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight) {

        // Make the canvas the same size
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw "Could not create context.";
    }
    return gl;
}