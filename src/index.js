async function main() {
    let canvas = document.getElementById("canvas");
    let gl     = canvas.getContext("webgl");
    if (!gl) {
        alert("No webgl context.")
    }

    // noinspection all
    new ResizeObserver(function () {
        resizeCanvas(gl);
    }).observe(canvas);

    let vertexShaderSource = null,
        frgmntShaderSource = null;


    let vertexPromise = $.get('vertex.glsl', null, function (data) {
            vertexShaderSource = data;
        }, 'text'),
        frgmntPromise = $.get('frgmnt.glsl', null, function (data) {
            frgmntShaderSource = data;
        }, 'text');

    await Promise.all([vertexPromise, frgmntPromise]);

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
        frgmntShader = createShader(gl, gl.FRAGMENT_SHADER, frgmntShaderSource);

    let program = createProgram(gl, vertexShader, frgmntShader);

    // START: Set up position buffer and attrib
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        0, 0,
        0, 1,
        1, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    let positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttribLocation);

    let size      = 2;
    let type      = gl.FLOAT;
    let normalize = false;
    let stride    = 0;
    let offset    = 0;
    gl.vertexAttribPointer(
        positionAttribLocation, size, type, normalize, stride, offset,
    );
    // END: Set up position buffer and attrib

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, frgmntShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, frgmntShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvas(gl) {
    console.log("Resize!");
    // Lookup the size the browser is displaying the canvas.
    let displayWidth  = gl.canvas.clientWidth,
        displayHeight = gl.canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (gl.canvas.width !== displayWidth ||
        gl.canvas.height !== displayHeight) {

        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}

$(document).ready(async function () {
    await main();
});