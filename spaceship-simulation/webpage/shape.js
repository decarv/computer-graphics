"use strict";
import {
    cross,
    mat4,
    mult, normalize,
    point3as4,
    point4as3,
    rotateX,
    rotateY,
    rotateZ, subtract,
    translate,
    vec3,
    vec4,
} from "../lib/MVnew.js";

class Shape {
    constructor(alpha) {
        this.COLORS = {
            black: vec4(0.0, 0.0, 0.0, 1.0),
            red: vec4(1.0, 0.0, 0.0, 1.0),
            yellow: vec4(1.0, 1.0, 0.0, 1.0),
            green: vec4(0.0, 1.0, 0.0, 1.0),
            blue: vec4(0.0, 0.0, 1.0, 1.0),
            magenta: vec4(1.0, 0.0, 1.0, 1.0),
            white: vec4(1.0, 1.0, 1.0, 1.0),
            cyan: vec4(0.0, 1.0, 1.0, 1.0),
            mars: vec4(0.6, 0.2, 0.0, 1.0)
        }

        this.vertices = [];
        this.colors = [];
        this.normals = [];

        this.C = {
            a: vec4(0.8, 0.8, 0.8, 1),
            d: []
        }

        this.alpha = alpha;

        this.pos = [0, 0, 0];

        this.vtheta = [0, 0, 0];

        this.rotation = mat4();
        this.scaling = mat4();
        this.translation = mat4();

        this.model = [];
    }

    /* Cria a matriz de transformação para transformar o modelo e gera o modelo transformado */
    transform(deltaTime, elapsedTime) {
        this.model = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            let newV = vec3(v[0], v[1], v[2]);
            this.model.push(newV);
        }
        let transformation = mat4();
        transformation = mult(this.scaling, transformation);
        const rx = rotateX(elapsedTime * this.vtheta[0]);
        const ry = rotateY(elapsedTime * this.vtheta[1]);
        const rz = rotateZ(elapsedTime * this.vtheta[2]);
        const animation = mult(rz, mult(ry, rx));
        transformation = mult(animation, transformation);
        transformation = mult(this.rotation, transformation);
        transformation = mult(this.translation, transformation);
        for (let i = 0; i < this.vertices.length; i++) {
            this.model[i] = point4as3(mult(transformation, point3as4(this.model[i])));
        }
        return this;
    }

    translate(point) {
        this.pos[0] = point[0];
        this.pos[1] = point[1];
        this.pos[2] = point[2];
        this.translation = translate(point[0], point[1], point[2]);
        return this;
    }

    setTranslation(point) {
        this.pos[0] = point[0];
        this.pos[1] = point[1];
        this.pos[2] = point[2];
        this.translation = translate(point[0], point[1], point[2]);
    }

    rotate(angles) {
        let rx = rotateX(angles[0]);
        let ry = rotateY(angles[1]);
        let rz = rotateZ(angles[2]);
        this.rotation = mult(this.rotation, mult(rz, mult(ry, rx)));
        return this;
    }

    scale(factors) {
        this.scaling = mat4();
        this.scaling[0][0] *= factors[0];
        this.scaling[1][1] *= factors[1];
        this.scaling[2][2] *= factors[2];
        this.scaling[3][3] = 1.0;
        return this;
    }

    animate(params) {
        this.vtheta = params;
        return this;
    }

    normalizePoint(p) {
        const x = 2 * (p[0] - (-100)) / (100 - (-100)) - 1;
        const y = 2 * (p[1] - (-100)) / (100 - (-100)) - 1;
        const z = 2 * (p[2] - (-100)) / (100 - (-100)) - 1;
        return vec3(x, y, z);
    }

    calculateNormal(a, b, c) {
        let u = subtract(b, a);
        let v = subtract(c, b);
        return normalize(cross(u, v));
    }

    calculateNormals() {
        this.normals = []
        for (let i = 0; i < this.model.length; i += 3) {
            const normal = this.calculateNormal(this.model[i], this.model[i+1], this.model[i+2]);
            this.normals.push(normal, normal, normal);
        }
    }
}

export default Shape;