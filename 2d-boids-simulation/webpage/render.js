import * as utils from "../lib/utils.js";
import config from "./config.js";

/**
 * Renderiza a cena da simulação atual, incluindo peixes e obstáculos.
 *
 * @param {WebGLRenderingContext} gl - O contexto WebGL usado para renderização.
 * @param {WebGLProgram} drawProgram - O programa WebGL que contém os shaders para desenhar os objetos.
 * @param {Array} fishes - Um array de objetos de peixes para serem renderizados.
 * @param {Boids} boids - O objeto Boids que contém a lógica para simulação do comportamento de cardume.
 * @param {Obstacles} obstacles - O objeto Obstacles que contém os obstáculos para serem renderizados.
 * @param {FlatBuffer} vertices - O buffer de vértices para os peixes.
 * @param {FlatBuffer} colors - O buffer de cores para os peixes.
 */
function render(gl, drawProgram, fishes, boids, obstacles, vertices, colors) {
    // atualiza o estado do sistema, dos boids, em relação à cena anterior
    boids.update();

    // atualiza o estado de cada peixe individualmente
    let vptr = 0;
    let cpos = 0;
    for (let fish of fishes) {
        fish.update();
        vptr = vertices.set(vptr, fish.vertices);
        for (let i = 0; i < fish.verticesCount; i++) {
            cpos = colors.set(cpos, fish.color);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(drawProgram);

    // Desenha Peixes
    let a_positionLocation = gl.getAttribLocation(drawProgram, "a_position");
    let a_colorLocation = gl.getAttribLocation(drawProgram, "a_color");
    let u_resolutionLocation = gl.getUniformLocation(drawProgram, "u_resolution");

    gl.uniform2f(u_resolutionLocation, gl.canvas.width, gl.canvas.height);

    let positionsBuffer = utils.makeBuffer(gl, vertices.data);
    utils.setAttribute(
        gl,
        a_positionLocation,
        {size: 2, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0}
    );

    let colorBuffer = utils.makeBuffer(gl, colors.data);
    utils.setAttribute(
        gl,
        a_colorLocation,
        {size: 4, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0}
    );

    gl.drawArrays(gl.TRIANGLES, 0, vptr / config.DIMENSIONS);

    // Desenha Obstáculos: essa etapa é feita para cada obstáculo
    let obstaclesVertices = new utils.FlatBuffer();
    let obstaclesColors = new utils.FlatBuffer();
    for (let obstacle of obstacles.obstacles) {
        let ovPtr = obstaclesVertices.set(0, obstacle.vertices);
        let ocPtr = 0;
        for (let i = 0; i < ovPtr / config.DIMENSIONS; i++) {
            ocPtr = obstaclesColors.set(ocPtr, obstacle.color);
        }

        let obstaclesPositionsBuffer = utils.makeBuffer(gl, obstaclesVertices.data)
        utils.setAttribute(
            gl,
            a_positionLocation,
            {size: 2, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0}
        );

        let obstaclesColorBuffer = utils.makeBuffer(gl, obstaclesColors.data);
        utils.setAttribute(
            gl,
            a_colorLocation,
            {size: 4, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0}
        );

        gl.drawArrays(gl.TRIANGLE_FAN, 0, ovPtr / config.DIMENSIONS);
    }

    // Verifica erros do WebGL
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.log("WEBGL Error:", error);
    }

    // Controla a animação
    if (config.ANIMATE) {
        window.requestAnimationFrame(function() {
            render(gl, drawProgram, fishes, boids, obstacles, vertices, colors);
        });
    }
}

export default render;