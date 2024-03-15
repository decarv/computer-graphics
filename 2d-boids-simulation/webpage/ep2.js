/* EP02 de MAC0420/MAC5744 - Simulação de movimento coletivo
 *
 * Nome: Henrique de Carvalho
 * NUSP: 11819104
 */

"use strict";

import * as utils from "../lib/utils.js";
import config from './config.js';
import Fish from "./fish.js";
import Flocks from "./flocks.js";
import Obstacles from "./obstacles.js"
import render from "./render.js"

window.onload = main;

function keyUpCallback(event, leader, fishes, gl, boids) {
    switch (event.key) {
        case 'ArrowUp':
            leader.accelerating = false;
            break;
        case 'ArrowDown':
            leader.breaking = false;
            break;
        case 'ArrowLeft':
            leader.steeringLeft = false;
            break;
        case 'ArrowRight':
            leader.steeringRight = false;
            break;
    }
}

/**
 * Lidar com o evento de pressionar uma tecla. Atualiza as propriedades do líder ou o estado do programa de acordo com a tecla pressionada.
 *
 * @param {KeyboardEvent} event - O evento de teclado gerado quando uma tecla é pressionada.
 * @param {Fish} leader - O peixe líder.
 * @param {Array} fishes - Array de todos os peixes.
 * @param {WebGLRenderingContext} gl - O contexto WebGL.
 * @param {Flocks} boids - O objeto que contém a lógica para simulação do comportamento de cardume.
 * @param {Obstacles} obstacles - O objeto que contém os obstáculos.
 * @param {FlatBuffer} vertices - O buffer de vértices para os peixes.
 * @param {FlatBuffer} colors - O buffer de cores para os peixes.
 * @param {WebGLProgram} drawProgram - O programa WebGL usado para desenhar objetos.
 */
function keyDownCallback(event, leader, fishes, gl, boids, obstacles, vertices, colors, drawProgram) {
    switch (event.key) {
        case 'ArrowUp':
            leader.accelerating = true;
            break;
        case 'ArrowDown':
            leader.breaking = true;
            break;
        case 'ArrowLeft':
            leader.steeringLeft = true;
            break;
        case 'ArrowRight':
            leader.steeringRight = true;
            break;
        case '+':
            const fish = boids.spawnFish();
            fishes.push(fish);
            break;
        case '-':
            fishes.pop();
            boids.removeFish();
            break;
        case 'p':
        case 'P':
            config.ANIMATE = !config.ANIMATE;
            render(gl, drawProgram, fishes, boids, obstacles, vertices, colors);
            break;
        case 's':
        case 'S':
            if (!config.ANIMATE)
                render(gl, drawProgram, fishes, boids, obstacles, vertices, colors);
            break;
    }
}

/**
 * Função principal do programa. Configura o contexto WebGL, compila os shaders, inicializa a simulação de peixes e lida com eventos de teclado.
 */
async function main() {
    let canvas = document.getElementById("myCanvas");
    let gl = canvas.getContext("webgl2");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let vertexShaderSource = await utils.fetchShaderSource("../lib/shaders/fish.vert")
    let fragmentShaderSource = await utils.fetchShaderSource("../lib/shaders/fish.frag")
    let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    let drawProgram = utils.createProgram(gl, vertexShader, fragmentShader);

    let obstacles = new Obstacles(gl, 3);
    let leader = new Fish(gl, [1.0, 0.843, 0.0, 1.0], true, obstacles);
    let fishes = [leader];
    let boids = new Flocks(gl, [0.6, 0.92, 0.69, 1.0], leader, obstacles);
    document.addEventListener('keydown', (event) => {
        keyDownCallback(event, leader, fishes, gl, boids, obstacles, vertices, colors, drawProgram);
    });
    document.addEventListener('keyup', (event) => {
        keyUpCallback(event, leader, fishes, gl, boids);
    });

    let vertices = new utils.FlatBuffer();
    let colors = new utils.FlatBuffer();

    render(gl, drawProgram, fishes, boids, obstacles, vertices, colors);
}