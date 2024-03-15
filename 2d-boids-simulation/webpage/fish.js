import * as utils from "../lib/utils.js";
import config from "./config.js";

// export { Fish, Boid, Leader };
// class Boid extends Model {
//
// }
//
// class Leader extends Model {
//
// }
//

class Fish {
    constructor(gl, color, isLeader = false, obstacles = null) {
        // Carrega os dados do peixe
        this.gl = gl;
        this.color = color
        this.isLeader = isLeader;
        this.obstacles = obstacles;


        let mag;
        if (this.isLeader) {
            // Fixei o local de nascimento do peixe líder
            this.tipX = 20;
            this.tipY = 10;
            this.angle = Math.PI / 4;
            mag = 0.5;
        } else {
            const tip = utils.getRandomCoordinates(
                gl.canvas.width,
                gl.canvas.height
            );
            this.tipX = tip.x;
            this.tipY = tip.y;
            this.angle = utils.getRandomAngle();
            mag = config.FISH_DEFAULT_SPEED;
        }

        this.velocity = {x: mag * Math.cos(this.angle), y: mag * Math.sin(this.angle)};
        this.acceleration = {x: 0.0, y: 0.0};
        this.accelerating = false;
        this.breaking = false;
        this.steeringLeft = false;
        this.steeringRight = false;

        const tip = [this.tipX, this.tipY];
        const right = [this.tipX - config.FISH_WIDTH, this.tipY - config.FISH_HEIGHT];
        const left = [this.tipX - config.FISH_WIDTH, this.tipY + config.FISH_HEIGHT];
        this.vertices = utils.flatten([tip, right, left]);
        this.verticesCount = this.vertices.length / config.DIMENSIONS;

        this.drawFish();
    }

    // TODO: refactor
    drawFish() {
        const newTipX = this.tipX + this.velocity.x;
        const newTipY = this.tipY + this.velocity.y;
        const dx = newTipX - this.tipX;
        const dy = newTipY - this.tipY;
        for (let i = 0; i < 6; i += config.DIMENSIONS) {
            this.vertices[i] += dx;
            this.vertices[i + 1] += dy;
        }
        this.tipX = newTipX;
        this.tipY = newTipY;

        const tip = [this.tipX, this.tipY];
        const right = [this.tipX - config.FISH_WIDTH, this.tipY - config.FISH_HEIGHT];
        const left = [this.tipX - config.FISH_WIDTH, this.tipY + config.FISH_HEIGHT];

        const centroid = //this.centroid();
        [
            (tip[0] + right[0] + left[0]) / 3,
            (tip[1] + right[1] + left[1]) / 3
        ];

        // Then rotate the entire fish model by this.angle
        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);
        const rotatedTip = this.rotatePoint(tip, centroid, cosAngle, sinAngle);
        const rotatedRight = this.rotatePoint(right, centroid, cosAngle, sinAngle);
        const rotatedLeft = this.rotatePoint(left, centroid, cosAngle, sinAngle);

        this.vertices = utils.flatten([rotatedTip, rotatedRight, rotatedLeft]);
    }

    rotatePoint(point, centroid, cosAngle, sinAngle) {
        // This function rotates a point around the center of the fish
        const dx = point[0] - centroid[0];
        const dy = point[1] - centroid[1];
        return [
            centroid[0] + dx * cosAngle - dy * sinAngle,
            centroid[1] + dx * sinAngle + dy * cosAngle
        ];
    }

    update() {
        this.updateSteeringAngle();
        this.updateAcceleration();
        this.updateVelocity();
        this.checkCollision();
        this.drag();
        this.drawFish();
    }

    updateSteeringAngle() {
        if (this.steeringLeft) {
            this.steer(config.ROTATION_ANGLE);
        }
        if (this.steeringRight) {
            this.steer(-config.ROTATION_ANGLE);
        }
    }

    updateVelocity() {
        const velocityUpdate = {
            x: this.acceleration.x * Math.cos(this.angle) / config.FPS,
            y: this.acceleration.y * Math.sin(this.angle) / config.FPS
        }

        this.velocity.x += velocityUpdate.x;
        this.velocity.y += velocityUpdate.y;

        const speed = this.speed();
        const normalizedVelocity = {
            x: this.velocity.x / speed,
            y: this.velocity.y / speed
        }

        if (speed >= config.FISH_MAX_SPEED * Math.sqrt(2)) {
            this.velocity.x = config.FISH_MAX_SPEED * normalizedVelocity.x;
            this.velocity.y = config.FISH_MAX_SPEED * normalizedVelocity.y;
        } else if (!this.isLeader && speed <= config.BOID_MIN_SPEED) {
            this.velocity.x = normalizedVelocity.x * config.BOID_MIN_SPEED;
            this.velocity.y = normalizedVelocity.y * config.BOID_MIN_SPEED;
        }
    }

    updateAcceleration() {
        if (this.isLeader) {
            if (this.accelerating) {
                this.acceleration.x = config.FISH_ACCELERATION;
                this.acceleration.y = config.FISH_ACCELERATION;
            }

            // A velocidade é um fator da frenagem, isso impede que a velocidade fique negativa eventualmente
            const factor = this.speed();
            if (this.breaking) {
                this.acceleration.x = -config.BREAKING_SPEED * config.FISH_ACCELERATION * factor;
                this.acceleration.y = -config.BREAKING_SPEED * config.FISH_ACCELERATION * factor;
            }
        } else {
            // Isso aqui é feito em outros lugares
        }
    }

    checkCollision() {
        // TODO: adjust reflection
        if (this.vertices[0] <= 0) {
            if (this.angle <= Math.PI) this.steer(-Math.PI/2);
            else this.steer(Math.PI / 2);
        } else if (this.vertices[0] >= this.gl.canvas.width) {
            if (this.angle <= Math.PI) this.steer(Math.PI/2);
            else this.steer(-Math.PI / 2);
        }
        if (this.vertices[1] <= 0) {
            if (this.angle <= 3*Math.PI/2) this.steer(-Math.PI/2);
            else this.steer(Math.PI / 2);
        } else if (this.vertices[1] >= this.gl.canvas.height) {
            if (this.angle <= Math.PI/2) this.steer(-Math.PI/2);
            else this.steer(Math.PI / 2);
        }
    }

    drag() {
        // TODO: melhorar o "drag"
        // Isso funciona como um "drag"

        const magnitude = Math.sqrt(
            this.acceleration.x**2 + this.acceleration.y**2
        )
        const normalizedAcceleration = {
            x: this.acceleration.x / magnitude,
            y: this.acceleration.y / magnitude
        }
        if (magnitude <= 0.1) {
            this.acceleration.x = 0.0;
            this.acceleration.y = 0.0;
        } else {
            this.acceleration.x = normalizedAcceleration.x * (magnitude - 0.1);
            this.acceleration.y = normalizedAcceleration.y * (magnitude - 0.1);
        }
    }

    steer(theta) {
        const mag = this.speed()
        this.angle = Math.abs((2 * Math.PI + this.angle + theta) % (2 * Math.PI));
        this.velocity.x = mag * Math.cos(this.angle);
        this.velocity.y = mag * Math.sin(this.angle);
    }

    speed() {
        return Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
    }

    centroid() {
        return {
            x: (this.vertices[0] + this.vertices[2] + this.vertices[4]) / 3,
            y: (this.vertices[1] + this.vertices[3] + this.vertices[5]) / 3
        }
    }

    applyCohesionForce(centerOfMass) {
        let centroid = this.centroid();

        let angle = Math.atan2((centroid.y - centerOfMass.y), (centroid.x - centerOfMass.x));
        let da = utils.angleDifference(this.angle, angle);
        let cohesionForce= config.COHESION_FORCE * Math.PI / 180;
        if (da > cohesionForce) da = cohesionForce;
        if (da < -cohesionForce) da = -cohesionForce;

        this.steer(da);
    }

    applySeparationForce(displacement) {
        if (displacement.x === 0 && displacement.y === 0) {
            return;
        }
        const displacementMagnitude = Math.sqrt(displacement.x ** 2 + displacement.y ** 2);
        const normalizedDisplacement = {
            x: displacement.x / displacementMagnitude,
            y: displacement.y / displacementMagnitude
        }
        
        const centroid = this.centroid();
        let angle = this.calculateAngle(centroid, displacement);
        let da = utils.angleDifference(this.angle, angle);
        const separationForce= config.SEPARATION_FORCE * Math.PI / 180;
        if (da > separationForce) da = separationForce;
        if (da < -separationForce) da = -separationForce;

        this.steer(-da); // TODO: por que negativa?
        
        this.acceleration.x += separationForce * normalizedDisplacement.x;
        this.acceleration.y += separationForce * normalizedDisplacement.y;
    }
    
    calculateAngle(vector1, vector2) {
      const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
      const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
      const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
      const cosAngle = dotProduct / (magnitude1 * magnitude2);
      return Math.acos(cosAngle);
    }

    applyAlignmentForce(perceivedVelocity) {
        const perceivedSpeed = Math.sqrt(perceivedVelocity.x ** 2 + perceivedVelocity.y ** 2);
        const normalizedPerceivedVelocity = {
            x: perceivedVelocity.x / perceivedSpeed,
            y: perceivedVelocity.y / perceivedSpeed
        }

        const speed = this.speed();
        const normalizedVelocity = {
            x: this.velocity.x / speed,
            y: this.velocity.y / speed
        }

        // A força de alinhamento de ângulo é uma constante C que multiplica a diferença de ângulo entre um
        // boid e o ângulo dos demais e faz o boid suavemente retornar para onde os demais apontam.
        const perceivedAngle = Math.atan2(perceivedVelocity.y, perceivedVelocity.x);
        let da = utils.angleDifference(this.angle, perceivedAngle);
        this.steer(-da * config.ANGLE_ALIGNMENT_FORCE);

        if (perceivedSpeed > speed) {
            this.acceleration.x += config.SPEED_ALIGNMENT_FORCE;
            this.acceleration.y += config.SPEED_ALIGNMENT_FORCE;
        } else {
            this.acceleration.x -= config.SPEED_ALIGNMENT_FORCE;
            this.acceleration.y -= config.SPEED_ALIGNMENT_FORCE;
        }
    }

    keepUpWithTheLeader(leader) {
        const centroid = this.centroid();
        const leaderCentroid = leader.centroid();
        const directionVector = {
            x: leaderCentroid.x - centroid.x,
            y: leaderCentroid.y - centroid.y
        }
        const directionVectorMagnitude = Math.sqrt(
            directionVector.x**2 + directionVector.y**2
        );
        const normalizedDirection = {
            x: directionVector.x / directionVectorMagnitude,
            y: directionVector.y /directionVectorMagnitude
        }
        const da = this.calculateAngle(this.velocity, directionVector);
        this.steer(-da * config.ANGLE_LEADER_ALIGNMENT_FORCE);

        // const factor = Math.max(
        //     0.1, Math.min(1, directionVectorMagnitude/100)
        // )
        // this.acceleration.x += factor * normalizedDirection.x;
        // this.acceleration.y += factor * normalizedDirection.y;

        // const speed = Math.sqrt(this.velocity.x**2 + this.velocity.y**2);
        // const leaderSpeed = Math.sqrt(leader.velocity.x**2 + leader.velocity.y**2);
        // const maxSpeed = Math.min(leaderSpeed, directionVectorMagnitude / 10);
    
        // if (speed > maxSpeed) {
        //     // If moving too fast, reduce speed directly
        //     const speedReductionFactor = maxSpeed / speed;
        //     this.velocity.x *= speedReductionFactor;
        //     this.velocity.y *= speedReductionFactor;
        // }
    }
}

export default Fish;