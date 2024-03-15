import * as utils from "../lib/utils.js";

/**
 * A classe Obstacle representa um único obstáculo no espaço da simulação.
 */
class Obstacle {
     /**
     * Constrói um novo obstáculo com posição e raio aleatórios.
     * 
     * @param {number} w - Largura do espaço do jogo.
     * @param {number} h - Altura do espaço do jogo.
     * @param {number} nv - Número de vértices do obstáculo.
     */
    constructor(w, h, nv) {
        const minRadius = w / 20;
        const maxRadius = w / 7;
        this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
        this.influenceRadius = this.radius + 25;

        this.color = [0.5, 0.5, 0.4, 1.0];
        const canvasOffset = this.radius * 2;
        this.center = {
            x: Math.random() * (w - 2*canvasOffset) + canvasOffset,
            y: Math.random() * (h - 2*canvasOffset) + canvasOffset,
        };

        this.buildObstacle(nv);
    }

    /**
     * Constrói um círculo com base no número de vértices fornecido.
     * 
     * @param {number} nv - Número de vértices do obstáculo.
     */
    buildObstacle(nv) {
        this.vertices = [this.center.x, this.center.y]
        let angle = 0;
        for (let i = 0; i <= nv; i++) {
            this.vertices.push(this.center.x + this.radius * Math.cos(angle));
            this.vertices.push(this.center.y + this.radius * Math.sin(angle))
            angle += 2 * Math.PI / nv;
        }
    }
}

/**
 * A classe Obstacles é responsável por gerenciar um conjunto de obstáculos no espaço do jogo.
 */
class Obstacles {
    /**
     * Constrói um conjunto de obstáculos.
     *
     * @param {WebGLRenderingContext} gl - O contexto WebGL no qual os obstáculos são renderizados.
     * @param {number} [number=1] - O número de obstáculos a serem gerados. Por padrão é 1.
     * @param {number} [nv=32] - O número de vértices de cada obstáculo. Por padrão é 32.
     */
    constructor(gl, number = 1, nv = 32) {
        this.gl = gl;
        this.number = number;
        this.nv = nv;
        this.obstacles = [];
        this.minimumDistance = 150; // 20 pixels

        this.generateObstacles();
    }

    get() {
        return this.obstacles;
    }

    /**
    * Gera os obstáculos e os armazena no array de obstáculos.
    */
    generateObstacles() {
        while (this.obstacles.length < this.number) {
            const obstacle = new Obstacle(this.gl.canvas.width, this.gl.canvas.height, this.nv);
            if (!this.collides(obstacle)) {
                this.obstacles.push(obstacle);
            }
        }
    }

    /**
    * Verifica se um novo obstáculo colide com qualquer um dos obstáculos existentes.
    * Serve para evitar criar obstáculos no mesmo lugar ou a uma distância menor que minimumDistance.
    *
    * @param {Obstacle} newObstacle - O novo obstáculo a ser verificado.
    * @returns {boolean} - Retorna true se houver colisão, false caso contrário.
    */
    collides(newObstacle) {
        for (let obstacle of this.obstacles) {
            const dx = obstacle.center.x - newObstacle.center.x;
            const dy = obstacle.center.y - newObstacle.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < obstacle.radius + newObstacle.radius + this.minimumDistance) {
                return true;
            }
        }
        return false;
    }
    
    /**
    * Verifica se há um obstáculo no ponto fornecido. Serve para evitar criar peixes no mesmo lugar.
    *
    * @param {Object} point - Um objeto com propriedades x e y representando um ponto no espaço 2D.
    * @returns {boolean} - Retorna true se houver um obstáculo no ponto, false caso contrário.
    */
    obstacleInPlace(point) {
        for (let obstacle of this.obstacles) {
            const dx = obstacle.center.x - point.x;
            const dy = obstacle.center.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < obstacle.radius) {
                return true;
            }
        }
        return false;
    }

    *[Symbol.iterator]() {
        for (let obstacle of this.obstacles) {
            yield obstacle;
        }
    }
}

export default Obstacles;