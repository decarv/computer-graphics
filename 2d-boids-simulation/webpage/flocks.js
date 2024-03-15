import Fish from "./fish.js";
import config from "./config.js"
import * as utils from "../lib/utils.js";

/**
 * Classe Flocks, usada para simular o comportamento de um cardume de peixes.
 * ref.: https://vergenet.net/~conrad/boids/pseudocode.html
 */
class Flocks {
    /**
     * Construtor da classe Flocks.
     *
     * @param {Object} gl - Contexto WebGL.
     * @param {string} color - Cor dos peixes.
     * @param {Object} leader - O peixe líder do cardume.
     * @param {Array} obstacles - Lista de obstáculos no ambiente.
     */
    constructor(gl, color, leader, obstacles = null) {
        this.gl = gl;
        this.color = color;
        this.leader = leader;
        this.obstacles = obstacles;
        this.fishes = [] // Lista onde são mantidos os boids
    }

    spawnFish() {
        let fish;
        let obstacleInPlace = true;
        while (obstacleInPlace) {
            obstacleInPlace = false;
            fish = new Fish(this.gl, this.color, false, this.obstacles);
            for (let i = 0; i < fish.vertices.length; i += 2) {
                const point = {
                    x: fish.vertices[i],
                    y: fish.vertices[i + 1]
                }
                if (this.obstacles.obstacleInPlace(point)) {
                    obstacleInPlace = true;
                    break;
                }
            }
        }
        this.fishes.push(fish);
        return fish;
    }

    removeFish() {
        this.fishes.pop();
    }

    /**
     * Realiza atualização dos dados do cardume e chama funções individuais para cada peixe ser atualizado de acordo
     * com os parâmetros calculados.
     */
    update() {
        if (this.fishes.length >= 1) {
            this.leaderCentroid = this.leader.centroid();
            this.cohesion();
            this.separation();
            this.alignment();
            this.leadership();
        }
    }

    /**
     * Devolve uma lista de centróides dos peixes do cardume.
     * @returns {*[]}
     */
    centroids() {
        let centroids = [];
        for (let fish of this.fishes) {
            centroids.push(fish.centroid());
        }
        return centroids;
    }

    /**
     * Aplica a regra de coesão ao cardume.
     *
     * A coesão é uma regra que move os peixes em direção ao centro do cardume.
     * Nesta implementação, o centro é ponderado pela posição do líder do cardume,
     * e pode ter uma influência maior de acordo com o parâmetro COHESION_LEADER_WEIGHT.
     * Note que a coesão é individual para cada peixe.
     */
    cohesion() {
        const centroids = this.centroids();
        let sum = {x: 0, y: 0};
        for (let fish of this.fishes) {
            const centroid = fish.centroid();
            sum.x += centroid.x;
            sum.y += centroid.y;
        }

        let N = this.fishes.length + config.COHESION_LEADER_WEIGHT;
        sum.x += N * this.leaderCentroid.x;
        sum.y += N * this.leaderCentroid.y;
        N = (N - 1) * 2;

        // N = this.boids.length - 1 (boid) + 1 (leader)
        for (let i = 0; i < this.fishes.length; i++) {
            let center = {
                x: (sum.x - centroids[i].x) / N,
                y: (sum.y - centroids[i].y) / N
            }
            this.fishes[i].applyCohesionForce(center);
        }
    }

    /**
     * Aplica a regra de separação ao cardume.
     *
     * A separação é uma regra que evita que os peixes se aproximem demais uns dos outros.
     * Os peixes repelirão uns aos outros se estiverem dentro de uma certa distância (SEPARATION_DISTANCE).
     * Isso é feito calculando um vetor de deslocamento que move o peixe para longe dos seus vizinhos próximos
     * e do líder se ele estiver muito perto. Note que o deslocamento é individual para cada peixe.
     */
    separation() {
        const centroids = this.centroids();
        let N = this.fishes.length;
        for (let i = 0; i < N; i++) {
            let displacement = {x: 0, y: 0};
            for (let j = 0; j < N; j++) {
                if (i !== j) {
                    if (utils.distance(centroids[i], centroids[j]) < config.SEPARATION_DISTANCE) {
                        displacement.x -= (centroids[j].x - centroids[i].x);
                        displacement.y -= (centroids[j].y - centroids[i].y);
                    }
                }
            }
            if (utils.distance(this.leaderCentroid, centroids[i]) < config.SEPARATION_DISTANCE) {
                displacement.x -= (this.leaderCentroid.x - centroids[i].x);
                displacement.y -= (this.leaderCentroid.y - centroids[i].y);
            }
            this.fishes[i].applySeparationForce(displacement);
        }
    }

    /**
     * Aplica a regra de alinhamento ao cardume.
     *
     * O alinhamento é uma regra que faz com que um peixe se alinhe na direção e velocidade médias do cardume.
     * Isso é feito calculando a velocidade média de todos os outros peixes e ajustando a velocidade do peixe atual para corresponder
     * às demais.
     */
    alignment() {
        // N = this.boids.length - 1 (boid) + N (leader)
        let N = this.fishes.length - 1;
        if (N <= 0) return;
        let sum = {x: 0, y: 0};
        for (let i = 0; i < N; i++) {
            sum.x += this.fishes[i].velocity.x;
            sum.y += this.fishes[i].velocity.y;
        }
        for (let i = 0; i < this.fishes.length; i++) {
            let perceivedVelocity = {
                x: (sum.x - this.fishes[i].velocity.x) / N,
                y: (sum.y - this.fishes[i].velocity.y) / N
            }
            this.fishes[i].applyAlignmentForce(perceivedVelocity);
        }
    }

    /**
     * Aplica a regra de liderança ao cardume.
     *
     * A liderança é uma regra que orienta os peixes para seguir o líder do cardume.
     * Isso é feito aplicando uma força no peixe que o direciona para o líder.
     */
    leadership() {
        const centroids = this.centroids();
        for (let i = 0; i < this.fishes.length; i++) {
            const distance = utils.distance(this.leaderCentroid, centroids[i])
            this.fishes[i].keepUpWithTheLeader(this.leader);
        }
    }
}

export default Flocks;