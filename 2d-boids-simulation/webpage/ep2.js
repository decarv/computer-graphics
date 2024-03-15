/* ep2.js
 *
 * Henrique de Carvalho, 2023
 */

"use strict";

import * as utils from "../lib/utils.js";
import events from "./events.js";
import config from './config.js';
import Fish from "./fish.js";
import {Boids} from "./boids.js";
import {FlatBuffer, randomColor} from "../lib/utils.js";
import Obstacles from "./obstacles.js"

window.onload = main;

const animate = true;

// TODO refactor
let separationForceInput;
let cohesionForceInput;
let separationForceValue;
let cohesionForceValue;

function keyUpCallback(event, leader, fishes, gl, boids) {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            leader.accelerating = false;
            break;
        case 's':
        case 'ArrowDown':
            leader.breaking = false;
            break;
        case 'ArrowLeft':
        case 'a':
            leader.steeringLeft = false;
            break;
        case 'ArrowRight':
        case 'd':
            leader.steeringRight = false;
            break;
    }
}

function keyDownCallback(event, leader, fishes, gl, boids, obstacles) {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            leader.accelerating = true;
            break;
        case 's':
        case 'ArrowDown':
            leader.breaking = true;
            break;
        case 'ArrowLeft':
        case 'a':
            leader.steeringLeft = true;
            break;
        case 'ArrowRight':
        case 'd':
            leader.steeringRight = true;
            break;
        case '+':
            const fish = boids.spawnFish();
            fishes.push(fish);
            break;
    }
}

async function main() {
    let canvas = document.getElementById("myCanvas");
    let gl = canvas.getContext("webgl2");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let transformVertexShaderSource = await utils.fetchShaderSource("../lib/shaders/calculateMove.vert")
    let vertexShaderSource = await utils.fetchShaderSource("../lib/shaders/fish.vert")
    let fragmentShaderSource = await utils.fetchShaderSource("../lib/shaders/fish.frag")
    let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    let transformVertexShader = utils.createShader(gl, gl.VERTEX_SHADER, transformVertexShaderSource);
    let transformFeedbackVaryings = ["v_position"]

    let drawProgram = utils.createProgram(gl, vertexShader, fragmentShader);
    let transformationsProgram = utils.createProgram(gl, transformVertexShader, fragmentShader, transformFeedbackVaryings);

    let obstacles = new Obstacles(gl, 5);
    let leader = new Fish(gl, [1.0, 0.843, 0.0, 1.0], true, obstacles);
    let fishes = [leader];
    let boids = new Boids(gl, [0.6, 0.92, 0.69, 1.0], leader, obstacles);
    document.addEventListener('keydown', (event) => {
        keyDownCallback(event, leader, fishes, gl, boids, obstacles);
    });
    document.addEventListener('keyup', (event) => {
        keyUpCallback(event, leader, fishes, gl, boids);
    });
    
    separationForceInput = document.getElementById('separation-force');
    cohesionForceInput = document.getElementById('cohesion-force');
    separationForceValue = document.getElementById('separation-force-value');
    cohesionForceValue = document.getElementById('cohesion-force-value');
    separationForceInput.addEventListener('input', updateSeparationForceValue);
    cohesionForceInput.addEventListener('input', updateCohesionForceValue);

    let vertices = new utils.FlatBuffer();
    let colors = new utils.FlatBuffer();
    render(gl, transformationsProgram, drawProgram, fishes, boids, obstacles, vertices, colors);
}

function updateSeparationForceValue() {
    const separationForce = parseFloat(separationForceInput.value);
    separationForceValue.textContent = separationForce;
    config.SEPARATION_FORCE = separationForce;
}

function updateCohesionForceValue() {
    const cohesionForce = parseFloat(cohesionForceInput.value);
    cohesionForceValue.textContent = cohesionForce;
    config.COHESION_FORCE = cohesionForce;
}

function render(gl, transformationsProgram, drawProgram, fishes, boids, obstacles, vertices, colors) {
    boids.update();
    let vptr = 0;
    let cpos = 0;
    for (let fish of fishes) {
        fish.update(); // update leader
        vptr = vertices.set(vptr, fish.vertices);
        for (let i = 0; i < fish.verticesCount; i++) {
            cpos = colors.set(cpos, fish.color);
        }
    }

    // unbind qualquer coisa que tenha ficado bound
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);


    gl.useProgram(drawProgram);

    /* -------------------------------------------------------------------------------------------------------------- */
    /* Desenha Peixes */

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

    /* -------------------------------------------------------------------------------------------------------------- */
    /* Desenha Obstáculos */

    let obstaclesVertices = new FlatBuffer();
    let obstaclesColors = new FlatBuffer();
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
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.log("WEBGL Error:", error);
    }


    // TODO: refactor
    if (animate)
        window.requestAnimationFrame(function() {
             render(gl, transformationsProgram, drawProgram, fishes, boids, obstacles, vertices, colors);
        });
    else
        setTimeout(() => {
            render(gl, transformationsProgram, drawProgram, fishes, boids, obstacles, vertices, colors);
        }, 500);
}