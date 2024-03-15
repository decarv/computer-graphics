import Fish from "./fish.js";
import config from "./config.js"

/* ref.: https://vergenet.net/~conrad/boids/pseudocode.html
 *
 */
class Boids {
    constructor(gl, color, leader, obstacles = null) {
        this.gl = gl;
        this.color = color;
        this.leader = leader;
        this.obstacles = obstacles;
        this.boids = []
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
                    console.log("obstacleInPlace");
                    break;
                }
            }
        }
        this.boids.push(fish);
        return fish;
    }

    update() {
        if (this.boids.length >= 1) {
            this.leaderCentroid = this.leader.centroid();
            this.cohesion();
            this.separation();
            this.alignment();
            // this.leadership();
        }
    }

    updateVelocities() {
        for (let boid of this.boids) {
            boid.updateVelocity();
        }
    }

    centroids() {
        let centroids = [];
        for (let fish of this.boids) {
            centroids.push(fish.centroid());
        }
        return centroids;
    }

    speeds() {
        let speeds = [];
        for (let fish of this.boids) {
            speeds.push(fish.speed());
        }
        return speeds;
    }

    angles() {
        let angles = [];
        for (let fish of this.boids) {
            angles.push(fish.angle);
        }
        return angles;
    }

    cohesion() {
        const centroids = this.centroids();
        let sum = {x: 0, y: 0};
        for (let fish of this.boids) {
            const centroid = fish.centroid();
            sum.x += centroid.x;
            sum.y += centroid.y;
        }

        let N = this.boids.length;
        sum.x += N * this.leaderCentroid.x;
        sum.y += N * this.leaderCentroid.y;
        N = (N - 1) * 2;

        // N = this.boids.length - 1 (boid) + 1 (leader)
        for (let i = 0; i < this.boids.length; i++) {
            let center = {
                x: (sum.x - centroids[i].x) / N,
                y: (sum.y - centroids[i].y) / N
            }
            this.boids[i].applyCohesionForce(center);
        }
    }

    separation(obstacles=null) {
        const centroids = this.centroids();
        if (obstacles !== null) {
            // TODO: obstacles
        }
        let N = this.boids.length;
        for (let i = 0; i < N; i++) {
            let displacement = {x: 0, y: 0};
            for (let j = 0; j < N; j++) {
                if (i !== j) {
                    if (this.distance(centroids[i], centroids[j]) < config.SEPARATION_DISTANCE) {
                        displacement.x -= (centroids[j].x - centroids[i].x);
                        displacement.y -= (centroids[j].y - centroids[i].y);
                    }
                }
            }
            if (this.distance(this.leaderCentroid, centroids[i]) < config.SEPARATION_DISTANCE) {
                displacement.x -= (this.leaderCentroid.x - centroids[i].x);
                displacement.y -= (this.leaderCentroid.y - centroids[i].y);
            }
            this.boids[i].applySeparationForce(displacement);
        }
    }

    distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    alignment() {
        // N = this.boids.length - 1 (boid) + N (leader)
        let N = this.boids.length - 1;
        if (N <= 0) return;

        let sum = {x: 0, y: 0};
        for (let i = 0; i < N; i++) {
            sum.x += this.boids[i].velocity.x;
            sum.y += this.boids[i].velocity.y;
        }

        for (let i = 0; i < this.boids.length; i++) {
            let perceivedVelocity = {
                x: (sum.x - this.boids[i].velocity.x) / N,
                y: (sum.y - this.boids[i].velocity.y) / N
            }
            this.boids[i].applyAlignmentForce(perceivedVelocity);
        }
    }

    leadership() {
        const centroids = this.centroids();
        // try to match leader speed and keep a minimum distance
        for (let i = 0; i < this.boids.length; i++) {
            const distance = this.distance(this.leaderCentroid, centroids[i])
            this.boids[i].keepUpWithTheLeader(this.leader);
        }
    }

}

export { Boids };