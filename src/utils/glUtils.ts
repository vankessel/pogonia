export enum AttribLoc {
    POSITION = 0,
    NORMAL = 1
}

export interface AttribOptions {
    size: GLint;
    type: GLenum;
    normalize: GLboolean;
    stride: GLsizei;
    offset: GLintptr;
}

// This base class is meant to mimic Java's static constructor concept. TypeScript does not support this.
// The static constructor is meant to be run once on the first object's initialization.
// The `staticCopy` variable is to enable polymorphism. In other words, each subclass
// should keep track if its static constructor has been called.
export abstract class StaticConstructor {
    protected static staticConstructorCalled = false;

    protected constructor(gl: WebGL2RenderingContext) {
        const staticCopy = this.constructor as typeof StaticConstructor;
        if (!staticCopy.staticConstructorCalled) {
            console.log(`Calling static constructor for: ${staticCopy.name}`);
            staticCopy.staticConstructor(gl);
            staticCopy.staticConstructorCalled = true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected static staticConstructor(gl: WebGL2RenderingContext): void {
        throw new Error('staticConstructor not implemented.');
    }
}

export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error('Could not create context.');
    }
    return gl;
}

export function createVao(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    if (!vao) {
        throw new Error('Could not create vertex array object.');
    }
    return vao;
}

export function createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (!buffer) {
        throw new Error('Could not create positionBuffer.');
    }
    return buffer;
}

export function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const texture = gl.createTexture();
    if (!texture) {
        throw new Error('Could not create texture.');
    }
    return texture;
}

export function createFramebuffer(gl: WebGL2RenderingContext): WebGLFramebuffer {
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        throw new Error('Could not create framebuffer.');
    }
    return framebuffer;
}

export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Could not create shader.');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error('Could not create shader.');
    }
    return shader;
}

export function createProgramFromShaders(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    frgmntShader: WebGLShader,
): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
        throw new Error('Could not create program.');
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error('Could not create program.');
    }
    return program;
}

export function createProgramFromSource(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    frgmntShaderSource: string,
): WebGLProgram {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const frgmntShader = createShader(gl, gl.FRAGMENT_SHADER, frgmntShaderSource);
    const program = gl.createProgram();
    if (!program) {
        throw new Error('Could not create program.');
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error('Could not link program.');
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
        height: viewportParams[3] - viewportParams[1],
    };
}

export function resizeCanvas(gl: WebGL2RenderingContext): void {
    // Lookup the size the browser is displaying the canvas.
    const canvas = gl.canvas as HTMLCanvasElement;

    // Check if the canvas is not the same size.
    if (canvas.width !== canvas.clientWidth / 2
        || canvas.height !== canvas.clientHeight / 2) {
        // Make the canvas the same size
        canvas.width = canvas.clientWidth / 2;
        canvas.height = canvas.clientHeight / 2;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
