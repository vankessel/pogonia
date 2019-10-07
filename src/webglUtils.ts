export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if(!shader){
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, frgmntShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if(!program){
        return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
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
