import * as utils from "../lib/utils.js";

class Obstacle {
    constructor(w, h, nv) {
        const minRadius = w / 50;
        const maxRadius = w / 10;
        this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
        this.color = [0.5, 0.5, 0.4, 1.0];
        const canvasOffset = this.radius * 2;
        this.center = {
            x: Math.random() * (w - 2*canvasOffset) + canvasOffset,
            y: Math.random() * (h - 2*canvasOffset) + canvasOffset,
        };

        this.buildObstacle(nv);
    }

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

class Obstacles {
    constructor(gl, number = 1, nv = 32) {
        this.gl = gl;
        this.number = number;
        this.nv = nv;
        this.obstacles = [];
        this.minimumDistance = 20; // 20 pixels

        this.generateObstacles();
    }

    get() {
        return this.obstacles;
    }

    generateObstacles() {
        while (this.obstacles.length < this.number) {
            const obstacle = new Obstacle(this.gl.canvas.width, this.gl.canvas.height, this.nv);
            if (!this.collides(obstacle)) {
                this.obstacles.push(obstacle);
            }
        }
    }

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