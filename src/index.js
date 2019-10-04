async function main() {
    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        alert("No webgl context.")
    }

    let vertexShaderSource;
    let fragmentShaderSource;


    let vertexPromise = $.get('vertex.glsl', null, function (data) {
        vertexShaderSource = data;
    }, 'text');

    let fragmentPromise = $.get('fragment.glsl', null, function (data) {
        fragmentShaderSource = data;
    }, 'text');

    await Promise.all([vertexPromise, fragmentPromise]);
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

$(document).ready(function () {
    main();
});