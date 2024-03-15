import Starship from "./starship.js";
import Cube from "./cube.js";
import LightSource from "./lightSource.js";
import Sphere from "./sphere.js";
import * as utils from "../lib/utils.js";
import {
    flatten,
    normalize,
    subtract,
    dot,
    vec3,
    cross,
    negate,
    lookAt,
    inverse4,
    transpose,
    mult
} from "../lib/MVnew.js";
import starship from "./starship.js";
import lightSource from "./lightSource.js";

class Engine {
    constructor() {
        this.ANIMATE = true;
        this.RUNNING = false;
        this.elapsedTime = 0;  // ms

        this.velInfo = document.getElementById("velInfo");
        this.dirInfo = document.getElementById("dirInfo");
        this.posInfo = document.getElementById("posInfo");
        this.thetaInfo = document.getElementById("thetaInfo");

        this.canvas = document.getElementById("myCanvas");
        this.gl = this.canvas.getContext("webgl2");
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.aspect = (this.canvas.width / this.canvas.height);

        // Shapes criadas
        this.shapes = [];

        // Fonte de Luz
        this.lightSource = new LightSource([0, 400, 0]);

        // Cubo de Referência
        const referenceCube = new Cube(
            ['blue', 'red', 'magenta', 'green', 'yellow', 'cyan']
        ).scale([30, 30, 30])
        this.shapes.push(referenceCube);

        const platform = new Cube(
            ['blue', 'red', 'magenta', 'mars', 'yellow', 'cyan']
        ).scale([3000, 50, 3000]).translate([0, -200, 0])
        this.shapes.push(platform);

        const rotatingCube1 = new Cube()
             .scale([100, 100, 100])
            .translate([-200, 50, -200])
            .animate([-0.1, 0, 0])
        this.shapes.push(rotatingCube1);

        const rotatingCube2 = new Cube()
             .scale([100, 100, 100])
            .translate([-200, 50, 200])
            .animate([0.0, -0.1, 0])
        this.shapes.push(rotatingCube2);

        const rotatingCube3 = new Cube()
            .scale([100, 100, 100])
            .translate([200, 50, -200])
            .animate([0.0, 0.0, -0.1])
        this.shapes.push(rotatingCube3);

        const rotatingSphere1 = new Sphere()
            .scale([100, 100, 100])
            .translate([200, 750, -200])
            .animate([0.0, 0.0, -0.1]);
        this.shapes.push(rotatingSphere1);

        const rotatingSphere2 = new Sphere()
            .scale([100, 100, 100])
            .translate([-200, 750, 200])
            .animate([0.0, -0.1, 0.0]);
        this.shapes.push(rotatingSphere2);

        const rotatingSphere3 = new Sphere()
            .scale([100, 100, 100])
            .translate([-200, 750, -200])
            .animate([-0.1, 0.0, 0.0]);
        this.shapes.push(rotatingSphere3);

        this.starshipNumber = 0;
        this.starshipList = [];
        this.addStarship([1500, 400, 1500]);
        this.addStarship([-500, 400, 500]);
        this.addStarship([500, 400, -500]);
        this.starship = this.starshipList[this.starshipNumber];

        // Lógica do Input
        this.keyInputQueue = [];
        this.mouseInputQueue = [];
        let mouseCaptured = false;
        let mouseX, mouseY;
        let bounds = this.canvas.getBoundingClientRect();
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey) {
                mouseCaptured = !mouseCaptured;
                if (mouseCaptured) {
                    document.body.style.cursor = 'none';
                } else {
                    document.body.style.cursor = 'auto';
                }
            } else if (event.key === 'm') {
                this.nextStarship();
            } else if (event.key === 'n') {
                this.prevStarship();
            } else if (event.key === '+') {
                this.addStarship(
                    [
                        utils.randomFloatInRange(-1000, 1000),
                        utils.randomFloatInRange(-100, 500),
                        utils.randomFloatInRange(-1000, 1000)
                    ]
                );
            } else if (event.key === '-') {
                this.prevStarship();
            } else {
             this.keyInputQueue.push(event.key);
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (mouseCaptured) {
                mouseX = (event.clientX - bounds.left) - this.canvas.width/2;
                mouseY = (this.canvas.height - (event.clientY - bounds.top)) - this.canvas.height/2;
                this.mouseInputQueue.push([mouseX, mouseY]);
            }
        });

        const stopButton = document.getElementById("stopAnimation");
        const stepButton = document.getElementById("stepAnimation");
        stopButton.addEventListener("click", (event) => {
            this.ANIMATE = !this.ANIMATE;
            if (this.ANIMATE) this.run();
        });
        stepButton.addEventListener("click", (event) => {
            let stepDeltaTime = 100;  // ms
            this.tick(stepDeltaTime);
        });

        // Cria os shaders e inicia o engine
        this.createShaders().then(
            () => this.run()
        );
    }

    async createShaders() {
        this.vertexShaderSource = await utils.fetchShaderSource("../lib/shaders/spaceship.vert")
        this.fragmentShaderSource = await utils.fetchShaderSource("../lib/shaders/spaceship.frag")
        this.vertexShader = utils.createShader(this.gl, this.gl.VERTEX_SHADER, this.vertexShaderSource);
        this.fragmentShader = utils.createShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);
        this.renderProgram = utils.createProgram(this.gl, this.vertexShader, this.fragmentShader);


        this.uPerspectiveLocation = this.gl.getUniformLocation(this.renderProgram, "u_perspective");
        this.uViewLocation = this.gl.getUniformLocation(this.renderProgram, "u_view");
        this.uModelLocation = this.gl.getUniformLocation(this.renderProgram, "u_model");
        this.uInverseTransposeLocation = this.gl.getUniformLocation(this.renderProgram, "u_inverse_transpose");

        this.uSpecularAlphaLocation = this.gl.getUniformLocation(this.renderProgram, "u_specular_alpha");

        this.uLightPositionLocation = this.gl.getUniformLocation(this.renderProgram, "u_light_position")
        this.aColorLocation = this.gl.getAttribLocation(this.renderProgram, "a_color");
        this.uAmbientLightLocation = this.gl.getUniformLocation(this.renderProgram, "u_ambient_light");
        this.uSpecularColorLocation = this.gl.getUniformLocation(this.renderProgram, "u_specular_color");

        this.uDiffuseLightLocation = this.gl.getUniformLocation(this.renderProgram, "u_diffuse_light");

        this.aPositionLocation = this.gl.getAttribLocation(this.renderProgram, "a_position");
        this.aNormalLocation = this.gl.getAttribLocation(this.renderProgram, "a_normal");

        this.lightSourceVertexShaderSource = await utils.fetchShaderSource("../lib/shaders/light_source.vert")
        this.lightSourceFragmentShaderSource = await utils.fetchShaderSource("../lib/shaders/light_source.frag")
        this.lightSourceVertexShader = utils.createShader(this.gl, this.gl.VERTEX_SHADER, this.lightSourceVertexShaderSource);
        this.lightSourceFragmentShader = utils.createShader(this.gl, this.gl.FRAGMENT_SHADER, this.lightSourceFragmentShaderSource);
        this.renderLightSourceProgram = utils.createProgram(this.gl, this.lightSourceVertexShader, this.lightSourceFragmentShader);
        this.uLightSourceViewLocation = this.gl.getUniformLocation(this.renderLightSourceProgram, "u_ls_view");
        this.uLightSourcePerspectiveLocation = this.gl.getUniformLocation(this.renderLightSourceProgram, "u_ls_perspective");
        this.aLightSourcePositionLocation = this.gl.getAttribLocation(this.renderLightSourceProgram, "a_ls_position");
    }

    run() {
        if (this.RUNNING) return;
        this.RUNNING = true;

        let lastTime = performance.now();
        const loop = (now = performance.now()) => {
            if (!this.ANIMATE) {
                this.RUNNING = false;
                return;
            }

            let deltaTime = now - lastTime;
            lastTime = now;
            this.tick(deltaTime);
            requestAnimationFrame(loop);
        };
        loop();
    }

    tick(deltaTime) {
        this.elapsedTime += deltaTime;
        this.update(deltaTime);
        this.render();

        this.displayInfo();
    }

    displayInfo() {
        // Informações mostradas na página HTML
        let dir = normalize(subtract(this.starship.at, this.starship.pos));
        let up = normalize(this.starship.up);
        let right = normalize(cross(up, dir));

        this.velInfo.textContent = `vel: [${this.starship.velocity[0].toFixed(3)}, ${this.starship.velocity[1].toFixed(3)}, ${this.starship.velocity[2].toFixed(3)}]`
        this.dirInfo.textContent = `dir: [${dir[0].toFixed(3)}, ${dir[1].toFixed(3)}, ${dir[2].toFixed(3)}]`
        this.posInfo.textContent = `pos: [${this.starship.pos[0].toFixed(3)}, ${this.starship.pos[1].toFixed(3)}, ${this.starship.pos[2].toFixed(3)}]`

        let thetaUp = Math.acos(dot(up, vec3(0, 1, 0))) * 180.0 / Math.PI;
        let thetaRight = Math.acos(dot(right, vec3(0, 0, 1))) * 180.0 / Math.PI;
        this.thetaInfo.textContent = `tilt: ${thetaUp.toFixed(3)}°`;
    }

    /**
     * Atualiza o estado dos objetos da simulação.
     *
     * @param {number} deltaTime - A quantidade de tempo que passou desde a última atualização.
     *                             Isso é usado para garantir que o movimento dos objetos seja
     *                             suave e consistente, independentemente da taxa de quadros
     *                             do jogo.
     *
     * A função realiza as seguintes tarefas:
     * 1. Passa as entradas de input para processamento pela Starship.
     * 2. Atualiza a posição da Starship com base na quantidade de tempo que passou.
     * 3. Atualiza o estado das formas. Usando também o tempo total passado na atualização da animação.
     */
    update(deltaTime) {
        while (this.keyInputQueue.length > 0) {
            const input = this.keyInputQueue.shift();
            this.starship.processKeyInput(input, deltaTime);
        }
        while (this.mouseInputQueue.length > 0) {
            const input = this.mouseInputQueue.shift();
            this.starship.processMouseInput(input, deltaTime);
        }
        for (const s of this.starshipList) {
            s.updatePosition(deltaTime, this.elapsedTime);
        }
        for (let shape of this.shapes) {
            shape.transform(deltaTime, this.elapsedTime);
            shape.calculateNormals();
        }
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Renderiza LightSource
        this.gl.useProgram(this.renderLightSourceProgram);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.gl.uniformMatrix4fv(
            this.uLightSourceViewLocation,
            false,
            flatten(this.starship.viewMatrix)
        );
        this.gl.uniformMatrix4fv(
            this.uLightSourcePerspectiveLocation,
            false,
            flatten(this.starship.perspectiveMatrix)
        );
        const lsVertices= this.lightSource.model.model;
        let positionsBuffer = utils.makeBuffer(this.gl, flatten(lsVertices));
        utils.setAttribute(
             this.gl,
             this.aLightSourcePositionLocation,
             {size: 3, datatype: this.gl.FLOAT, normalize: false, stride: 0, offset: 0}
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, lsVertices.length);


        // Renderiza Formas
        this.gl.useProgram(this.renderProgram);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.gl.uniformMatrix4fv(
            this.uViewLocation,
            false,
            flatten(this.starship.viewMatrix)
        );
        this.gl.uniformMatrix4fv(
            this.uPerspectiveLocation,
            false,
            flatten(this.starship.perspectiveMatrix)
        );
        this.gl.uniformMatrix4fv(
            this.uInverseTransposeLocation,
            false,
            flatten(transpose(inverse4(this.starship.viewMatrix)))
        );
        this.gl.uniform4fv(this.uLightPositionLocation, this.lightSource.pos);
        this.gl.uniform4fv(this.uAmbientLightLocation, this.lightSource.La);
        this.gl.uniform4fv(this.uDiffuseLightLocation, this.lightSource.Ld);
        this.gl.uniform4fv(this.uSpecularColorLocation, this.lightSource.Ls);

        for (const shape of this.shapes) {
            let positionsBuffer = utils.makeBuffer(this.gl, flatten(shape.model));
            utils.setAttribute(
                this.gl,
                this.aPositionLocation,
                {size: 3, datatype: this.gl.FLOAT, normalize: false, stride: 0, offset: 0}
            );

            let cdBuffer = utils.makeBuffer(this.gl, flatten(shape.C.d));
            utils.setAttribute(
                this.gl,
                this.aColorLocation,
                {size: 4, datatype: this.gl.FLOAT, normalize: false, stride: 0, offset: 0}
            );

            let normalsBuffer = utils.makeBuffer(this.gl, flatten(shape.normals));
            utils.setAttribute(
                this.gl,
                this.aNormalLocation,
                {size: 3, datatype: this.gl.FLOAT, normalize: false, stride: 0, offset: 0}
            )

            this.gl.uniform1f(this.uSpecularAlphaLocation, shape.alpha);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, shape.model.length);
        }

        let error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
            console.log("WEBGL Error:", error);
        }
    }

    addStarship(position) {
        const starship = new Starship(position, this.aspect);
        this.starshipList.push(starship);
        this.shapes.push(starship.model);
    }

    nextStarship() {
        this.starshipNumber = (this.starshipNumber + 1) % this.starshipList.length;
        this.starship = this.starshipList[this.starshipNumber];
    }

    prevStarship() {
        this.starshipNumber = (this.starshipNumber - 1) % this.starshipList.length;
        if (this.starshipNumber < 0) {
            this.starshipNumber = this.starshipList.length - 1;
        }
        this.starship = this.starshipList[this.starshipNumber];
    }
}

export default Engine;