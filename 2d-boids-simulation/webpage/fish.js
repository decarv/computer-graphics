import * as utils from "../lib/utils.js";
import config from "./config.js";

/**
 * A classe Fish representa um peixe individual na simulação.
 * Cada peixe tem seu próprio conjunto de propriedades, incluindo posição, velocidade, aceleração, 
 * e se ele é um líder ou não.
 */
class Fish {
     /**
      * Cria um novo peixe.
      *
      * @param {WebGLRenderingContext} gl - O contexto WebGL a ser usado.
      * @param {string} color - A cor do peixe.
      * @param {boolean} isLeader - Indica se o peixe é um líder.
      * @param {array} obstacles - Uma lista de obstáculos presentes no ambiente.
      */
    constructor(gl, color, isLeader = false, obstacles = null) {
        // Carrega os dados do peixe
        this.gl = gl;
        this.color = color
        this.isLeader = isLeader;
        this.obstacles = obstacles;

        let mag;
        if (this.isLeader) {
            // O peixe líder tem local de nascimento fixo
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

        // O método construtor inicia o peixe com atributos básicos, incluindo posição,
        // velocidade e aceleração. As variáveis a seguir ajudam a controlar o comportamento
        // esperado do peixe
        this.velocity = {x: mag * Math.cos(this.angle), y: mag * Math.sin(this.angle)};
        this.acceleration = {x: 0.0, y: 0.0};
        this.accelerating = false;
        this.breaking = false;
        this.steeringLeft = false;  // usado para o peixe líder
        this.steeringRight = false;  // usado para o peixe líder

        this.tip = [this.tipX, this.tipY];
        this.right = [this.tipX - config.FISH_WIDTH, this.tipY - config.FISH_HEIGHT];
        this.left = [this.tipX - config.FISH_WIDTH, this.tipY + config.FISH_HEIGHT];
        this.vertices = utils.flatten([this.tip, this.right, this.left]);
        this.verticesCount = this.vertices.length / config.DIMENSIONS;


        this.withinInfluenceField = false;

        this.drawFish();
    }

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

        const centroid =
        [
            (tip[0] + right[0] + left[0]) / 3,
            (tip[1] + right[1] + left[1]) / 3
        ];

        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);
        const rotatedTip = utils.rotatePoint(tip, centroid, cosAngle, sinAngle);
        const rotatedRight = utils.rotatePoint(right, centroid, cosAngle, sinAngle);
        const rotatedLeft = utils.rotatePoint(left, centroid, cosAngle, sinAngle);

        this.tip = {x: rotatedTip[0], y: rotatedTip[1]};
        this.right = {x: rotatedRight[0], y: rotatedRight[1]};
        this.left = {x: rotatedLeft[0], y: rotatedLeft[1]};

        this.vertices = utils.flatten([rotatedTip, rotatedRight, rotatedLeft]);
    }

    /**
     * Atualiza o estado do peixe.
     */
    update() {
        this.updateSteeringAngle();
        this.updateAcceleration();
        this.updateVelocity();
        this.wallCollision();
        this.drag();
        this.divertFromObstacle();
        this.drawFish();
    }
    
    /**
     * Atualiza o ângulo de direção do peixe líder. O ângulo de direção dos boids são atualizados por meio das aplicações
     * das forças.
     */   
    updateSteeringAngle() {
        if (this.steeringLeft) {
            this.steer(config.ROTATION_ANGLE);
            this.withinInfluenceField = false;
        }
        if (this.steeringRight) {
            this.steer(-config.ROTATION_ANGLE);
            this.withinInfluenceField = false;
        }
    }

    /**
     * Atualiza a velocidade do peixe, baseado na aceleração que possui. Usa config.FPS para controlar o aumento de velocidade
     * ajustado pelo FPS (apenas virtualmente).
     */
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

    /**
     * Atualiza a aceleração do peixe líder.
     */
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
        }
    }

    /**
     * Verifica se o peixe colidiu com a parede e altera o ângulo do peixe em 90 graus. 90 graus é arbitrário, só ficou
     * mais realista dessa forma, mantendo uma simplicidade na forma de giro.
     */
    wallCollision() {
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

    /**
     * Função usada para controlar o comportamento do peixe ao redor de obstáculos. Cada obstáculo tem uma esfera de influência
     * verificada pela distância a cada peixe. Quão mais perto está um peixe, mais ele sofre uma repulsão em seu ângulo.
     * O multiplyingFactor é usado para definir em qual sentido o peixe vira para contornar o obstáculo.
     */
    divertFromObstacle() {
        this.withinInfluenceField = false;
        const centroid = this.centroid();
        for (let obstacle of this.obstacles) {
            const distance = utils.distance(obstacle.center, this.tip);

            if (distance > obstacle.influenceRadius) {
                continue;
            }

            const v = {
                     x: obstacle.center.x - centroid.x,
                     y: obstacle.center.y - centroid.y
            };
            const angle = Math.PI/2 - utils.calculateAngle(v, this.velocity);
            this.obstacleMultiplyingFactor = 1;
            if (utils.distance(this.right, obstacle.center) > utils.distance(this.left, obstacle.center)) {
                this.obstacleMultiplyingFactor *= -1;
            }

            const distanceFactor = 1 + 1/distance;
            if (distance <= obstacle.radius + 5) {
                this.obstacleMultiplyingFactor *= 4;
            } else if (distance <= obstacle.radius + 10) {
                this.obstacleMultiplyingFactor *= 2;
            } else if (distance <= obstacle.influenceRadius) {
                this.obstacleMultiplyingFactor *= 0.5;
            }
            this.withinInfluenceField = true;
            this.steer(angle * this.obstacleMultiplyingFactor * distanceFactor);
        }
    }

    /**
     * Controla a aceleração dos peixes. Funciona como um atrito.
     */
    drag() {
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

    /**
     * A movimentação angular é realizada por meio dessa função.
     * @param theta
     */
    steer(theta) {
        const speed = this.speed()
        this.angle = Math.abs((2 * Math.PI + this.angle + theta) % (2 * Math.PI));
        this.velocity.x = speed * Math.cos(this.angle);
        this.velocity.y = speed * Math.sin(this.angle);
    }

    /**
     * Retorna a velocidade escalar do peixe.
     * @returns {number}
     */
    speed() {
        return Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
    }

    /**
     * Retorna o centróide do peixe.
     * @returns {{x: number, y: number}}
     */
    centroid() {
        return {
            x: (this.vertices[0] + this.vertices[2] + this.vertices[4]) / 3,
            y: (this.vertices[1] + this.vertices[3] + this.vertices[5]) / 3
        }
    }

    /**
     * Aplica a força de coesão a um peixe individualmente, é chamada pela classe que representa os Boids.
     * @param centerOfMass
     */
    applyCohesionForce(centerOfMass) {
        let centroid = this.centroid();

        let angle = Math.atan2((centroid.y - centerOfMass.y), (centroid.x - centerOfMass.x));
        let da = utils.angleDifference(this.angle, angle);
        let cohesionForce= config.COHESION_FORCE * Math.PI / 180;
        if (da > cohesionForce) da = cohesionForce;
        if (da < -cohesionForce) da = -cohesionForce;

        let obstacleFactor = 1;
        if (this.withinInfluenceField)
            obstacleFactor *= 0.3;
        this.steer(da * obstacleFactor);
    }

    /**
     * Aplica a força de separação individualmente a cada peixe. Para isso, usa displacement, que é o vetor para onde o
     * peixe deveria se deslocar. Calcula o ângulo de displacement e aplica uma aceleração.
     * @param displacement
     */
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
        let angle = utils.calculateAngle(centroid, displacement);
        let da = utils.angleDifference(this.angle, angle);
        const separationForce= config.SEPARATION_FORCE * Math.PI / 180;
        if (da > separationForce) da = separationForce;
        if (da < -separationForce) da = -separationForce;

        // Usado para evitar que os peixes insistam em entrar nos obstáculos por meio da aplicaçõa dessa força.
        let obstacleFactor = 1;
        if (this.withinInfluenceField)
            obstacleFactor *= 0.3;
        this.steer(-da * obstacleFactor * 0.9);
        
        this.acceleration.x += obstacleFactor * separationForce * normalizedDisplacement.x * 5;
        this.acceleration.y += obstacleFactor * separationForce * normalizedDisplacement.y * 5;
    }

    /**
     * Esta função aplica uma força de alinhamento ao cardume. O parâmetro perceivedVelocity representa a velocidade
     * aparente dos outros peixes nas redondezas. Com isso é capaz de alinhar velocidade e ângulo de cada peixe.
     * @param perceivedVelocity
     */
    applyAlignmentForce(perceivedVelocity) {
        // A força de alinhamento de ângulo é uma constante C que multiplica a diferença de ângulo entre um
        // boid e o ângulo dos demais e faz o boid suavemente retornar para onde os demais apontam.
        const perceivedSpeed = Math.sqrt(perceivedVelocity.x ** 2 + perceivedVelocity.y ** 2);
        const speed = this.speed();
        const perceivedAngle = Math.atan2(perceivedVelocity.y, perceivedVelocity.x);
        let da = utils.angleDifference(this.angle, perceivedAngle);

        // Fator usado como ajuste para impedir que os peixes insistam em se ajustar em torno de obstáculos
        let obstacleFactor = 1;
        this.steer(-da * config.ANGLE_ALIGNMENT_FORCE * obstacleFactor);

        // Se a velocidade percebida for maior que a velocidade deste boid, aumenta a aceleração para acompanhar.
        // Se for menor, reduz a aceleração para desacelerar.
        // A quantidade de mudança de aceleração é determinada pela SPEED_ALIGNMENT_FORCE da configuração.
        if (perceivedSpeed > speed) {
            this.acceleration.x += config.SPEED_ALIGNMENT_FORCE;
            this.acceleration.y += config.SPEED_ALIGNMENT_FORCE;
        } else {
            this.acceleration.x -= config.SPEED_ALIGNMENT_FORCE;
            this.acceleration.y -= config.SPEED_ALIGNMENT_FORCE;
        }
    }

    /**
     * Função usada para manter os peixes próximos do líder. Ela calcula velocidade do líder e acelera o peixe, de acordo
     * com uma função baseada na distância.
     * @param leader
     */
    keepUpWithTheLeader(leader) {
        const centroid = this.centroid();
        const leaderCentroid = leader.centroid();
        const distance = utils.distance(centroid, leaderCentroid);
        const followDistance = this.gl.canvas.width / 3;
        let speedFactor;
        if (distance > followDistance) {
            speedFactor = config.FISH_MAX_SPEED;
        } else {
            speedFactor = config.FISH_MIN_SPEED + (
                config.FISH_MAX_SPEED - config.FISH_MIN_SPEED) * (
                    distance / followDistance);
        }

        speedFactor *= 2;

        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        const direction = { x: this.velocity.x / speed, y: this.velocity.y / speed };

        this.velocity.x = direction.x * speedFactor;
        this.velocity.y = direction.y * speedFactor;

        const angle = Math.atan2(direction.y, direction.x);
        let da = utils.angleDifference(this.angle, angle);
        this.steer(da * config.ANGLE_LEADER_ALIGNMENT_FORCE);
    }
}

export default Fish;