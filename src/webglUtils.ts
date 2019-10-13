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
        throw "Could not create program.";
    }
    return program;
}

export function resizeCanvas(gl: WebGL2RenderingContext): void {
    // Lookup the size the browser is displaying the canvas.
    const canvas = gl.canvas as HTMLCanvasElement;
    const displayWidth = canvas.clientWidth,
        displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
