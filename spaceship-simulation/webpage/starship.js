import {
    lookAt, perspective, vec3, normalize, mult, rotate, vec4, subtract, cross, add, vec3as4, vec4as3, negate, inverse4
} from "../lib/MVnew.js"
import Sphere from "./sphere.js";

class Starship {
    constructor(position, aspect) {

        this.ACCELERATION = 0.0001; // 1 m/s^2
        this.velocity = vec3(0.0, 0.0, 0.0);

        this.fovy = 45.0;
        this.aspect = aspect;
        this.near = 0.1;
        this.far = 5000;

        this.pos = vec3(...position);
        this.at = vec3(0, 0, 0);
        this.up = vec3(0, 1, 0);
        let dir = normalize(subtract(this.at, this.pos));
        this.right = normalize(cross(this.up, dir));
        this.up = cross(dir, this.right);

        this.viewPlane = 0; // this is a linear combination of
        this.lastMousePositionX = 0;
        this.lastMousePositionY = 0;
        this.viewMatrix = lookAt(this.pos, this.at, this.up);
        this.perspectiveMatrix = perspective(this.fovy, this.aspect, this.near, this.far);

        this.modelRadius = 10;
        this.model = new Sphere([0.69, 0.69, 0.69, 1], 500.0)
            .scale([this.modelRadius, this.modelRadius, this.modelRadius]);
        this.updateModelPosition(dir, 0, 0);
    }


    calculateNearPlanePoint(normalizedX, normalizedY, width, height, fovy, nearPlaneDistance) {
        // Convert normalized coordinates to screen coordinates
        const screenX = normalizedX * (width / 2);
        const screenY = normalizedY * (height / 2);

        // Calculate aspect ratio
        const aspectRatio = width / height;

        // Calculate horizontal and vertical fov
        const horizontalFov = fovy * aspectRatio;
        const verticalFov = fovy;

        // Calculate half width and height of the near plane
        const halfWidth = Math.tan(horizontalFov / 2) * nearPlaneDistance;
        const halfHeight = Math.tan(verticalFov / 2) * nearPlaneDistance;

        // Calculate actual point on the near plane
        const actualX = screenX * halfWidth;
        const actualY = screenY * halfHeight;

        return { x: actualX, y: actualY };
    }

    processKeyInput(input, deltaTime) {
        switch(input) {
            case 'j':
            case 'J':
                this.frontEngine(deltaTime);
                break;
            case 'l':
            case 'L':
                this.backEngine(deltaTime);
                break;
            case 'k':
            case 'K':
                this.stopSpaceship(deltaTime);
                break;
            case 'w':
            case 'W':
                this.pitchClockwise(deltaTime);
                break;
            case 'x':
            case 'X':
                this.pitchCounterClockwise(deltaTime);
                break;
            case 'a':
            case 'A':
                this.yawClockwise(deltaTime);
                break;
            case 'd':
            case 'D':
                this.yawCounterClockwise(deltaTime);
                break;
            case 'z':
            case 'Z':
                this.rollCounterClockwise(deltaTime);
                break;
            case 'c':
            case 'C':
                this.rollClockwise(deltaTime);
                break;
        }
    }

    processMouseInput(input, deltaTime) {
        let sensitivity = 0.25;

        let [mouseX, mouseY] = input;

        let deltaMouseX = mouseX - this.lastMousePositionX;
        let deltaMouseY = mouseY - this.lastMousePositionY;
        this.lastMousePositionX = mouseX;
        this.lastMousePositionY = mouseY;

        // Calculate actual x and y coordinates on the far plane
        this.pitch(deltaMouseY * sensitivity, deltaTime);
        this.yaw(deltaMouseX * sensitivity, deltaTime);
    }

    stopSpaceship() {
        this.velocity = vec3(0.0, 0.0, 0.0);
    }

    thrust(engine, deltaTime) {
        const dir = normalize(subtract(this.at, this.pos));
        const scaledDir = mult((engine) * this.ACCELERATION * deltaTime, dir);
        this.velocity = add(this.velocity, scaledDir);
    }

    backEngine(deltaTime) {
        this.thrust(1, deltaTime);
    }

    frontEngine(deltaTime) {
        this.thrust(-1, deltaTime);
    }

    pitch(angle, deltaTime) {
        let dir = normalize(subtract(this.at, this.pos));
        let axis = cross(normalize(this.up), dir);
        const rotationMatrix = rotate(angle, axis);

        const rotatedDir = mult(rotationMatrix, vec4(dir[0], dir[1], dir[2], 1));
        this.at = add(this.pos, vec3(rotatedDir[0], rotatedDir[1], rotatedDir[2]));

        let upDir = normalize(this.up);
        const rotatedUpDir = normalize(mult(rotationMatrix, vec4(upDir[0], upDir[1], upDir[2], 1)));
        this.up = vec3(rotatedUpDir[0], rotatedUpDir[1], rotatedUpDir[2]);
    }

    pitchClockwise(deltaTime) {
        this.pitch(-0.5, deltaTime);
    }

    pitchCounterClockwise(deltaTime) {
        this.pitch(0.5, deltaTime);
    }

    yaw(angle, deltaTime) {
        let dir = normalize(subtract(this.at, this.pos));
        const rotationAxis = normalize(this.up);
        const rotationMatrix = rotate(angle, rotationAxis);
        const rotatedDirection = mult(rotationMatrix, vec3as4(dir));
        this.at = add(vec4as3(rotatedDirection), this.pos);
    }

    yawClockwise(deltaTime) {
        this.yaw(-1, deltaTime);
    }

    yawCounterClockwise(deltaTime) {
        this.yaw(1, deltaTime);
    }

    roll(angle, deltaTime) {
        const lookDir = normalize(subtract(this.at, this.pos));
        const rotationAxis = normalize(negate(lookDir));
        const rotationMatrix = rotate(angle, rotationAxis);
        const rotatedDirection = mult(rotationMatrix, vec3as4(this.up));
        this.up = normalize(vec4as3(rotatedDirection));
    }

    rollCounterClockwise(angle, deltaTime) {
        this.roll(1, deltaTime);
    }

    rollClockwise(angle, deltaTime) {
        this.roll(-1, deltaTime);
    }

    updatePosition(deltaTime, elapsedTime) {
        let dir = normalize(subtract(this.at, this.pos));
        const displacement = mult(deltaTime, this.velocity);
        this.pos = add(this.pos, displacement);
        this.at = vec3(add(dir, this.pos));
        this.viewMatrix = lookAt(this.pos, this.at, this.up);

        this.updateModelPosition(dir, deltaTime, elapsedTime);
    }

    updateModelPosition(dir, deltaTime, elapsedTime) {
        this.model.transform(deltaTime, elapsedTime);
        this.model.translate([
            this.pos[0] - this.modelRadius * dir[0],
            this.pos[1] - this.modelRadius * dir[1],
            this.pos[2] - this.modelRadius * dir[2]
        ]);
        this.model.calculateNormals();
    }
}

export default Starship;