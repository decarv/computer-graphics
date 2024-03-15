

"use strict";
import {cross, subtract, vec3, vec4} from "../lib/MVnew.js"
import Shape from "./shape.js";
import {randomColor} from "../lib/utils.js";


class Cube extends Shape {
    constructor(colors = null, alpha = 30.0) {
        super(alpha);

        this.CUBO_CANTOS = [
            vec4(-0.5, -0.5, 0.5, 1.0),
            vec4(-0.5, 0.5, 0.5, 1.0),
            vec4(0.5, 0.5, 0.5, 1.0),
            vec4(0.5, -0.5, 0.5, 1.0),
            vec4(-0.5, -0.5, -0.5, 1.0),
            vec4(-0.5, 0.5, -0.5, 1.0),
            vec4(0.5, 0.5, -0.5, 1.0),
            vec4(0.5, -0.5, -0.5, 1.0)
        ];
        this.vertices = [];
        this.quad(1, 0, 3, 2);
        this.quad(2, 3, 7, 6);
        this.quad(3, 0, 4, 7);
        this.quad(6, 5, 1, 2);
        this.quad(4, 5, 6, 7);
        this.quad(5, 4, 0, 1);
        console.log(this.vertices);

        // this.vertices = [
        //     // Face Z
        //     vec3(-0.5, -0.5, 0.5),
        //     vec3(-0.5, 0.5, 0.5),
        //     vec3(0.5, 0.5, 0.5),
        //     vec3(-0.5, -0.5, 0.5),
        //     vec3(0.5, 0.5, 0.5),
        //     vec3(0.5, -0.5, 0.5),
        //
        //     // Face -Z
        //     vec3(-0.5, -0.5, -0.5),
        //     vec3(0.5, 0.5, -0.5),
        //     vec3(-0.5, 0.5, -0.5),
        //     vec3(-0.5, -0.5, -0.5),
        //     vec3(0.5, -0.5, -0.5),
        //     vec3(0.5, 0.5, -0.5),
        //
        //     // Face -X
        //     vec3(-0.5, -0.5, -0.5),
        //     vec3(-0.5, 0.5, -0.5),
        //     vec3(-0.5, 0.5, 0.5),
        //     vec3(-0.5, -0.5, -0.5),
        //     vec3(-0.5, 0.5, 0.5),
        //     vec3(-0.5, -0.5, 0.5),
        //
        //     // Face X
        //     vec3(0.5, -0.5, -0.5),
        //     vec3(0.5, 0.5, 0.5),
        //     vec3(0.5, 0.5, -0.5),
        //     vec3(0.5, -0.5, -0.5),
        //     vec3(0.5, -0.5, 0.5),
        //     vec3(0.5, 0.5, 0.5),
        //
        //     // Face Y
        //     vec3(-0.5, 0.5, -0.5),
        //     vec3(-0.5, 0.5, 0.5),
        //     vec3(0.5, 0.5, 0.5),
        //     vec3(-0.5, 0.5, -0.5),
        //     vec3(0.5, 0.5, 0.5),
        //     vec3(0.5, 0.5, -0.5),
        //
        //     // Face -Y
        //     vec3(-0.5, -0.5, -0.5),  // triangle 1
        //     vec3(0.5, -0.5, 0.5),
        //     vec3(-0.5, -0.5, 0.5),
        //     vec3(-0.5, -0.5, -0.5),  // triangle 2
        //     vec3(0.5, -0.5, -0.5),
        //     vec3(0.5, -0.5, 0.5),
        //
        // ];

        // this.calculateNormals();

        if (colors) {
            for (let i = 0; i < this.vertices.length / 6; i++) {
                this.C.d.push(this.COLORS[colors[i]]);
                this.C.d.push(this.COLORS[colors[i]]);
                this.C.d.push(this.COLORS[colors[i]]);
                this.C.d.push(this.COLORS[colors[i]]);
                this.C.d.push(this.COLORS[colors[i]]);
                this.C.d.push(this.COLORS[colors[i]]);
            }
        } else {
            for (let i = 0; i < this.vertices.length; i++) {
                const color = randomColor();
                this.C.d.push(color);
                this.C.d.push(color);
                this.C.d.push(color);
                this.C.d.push(color);
                this.C.d.push(color);
                this.C.d.push(color);
            }
        }
    }

    quad(a, b, c, d) {
        let vert = this.CUBO_CANTOS;
        let t1 = subtract(vert[b], vert[a]);
        let t2 = subtract(vert[c], vert[b]);
        let normal = cross(t1, t2);
        normal = vec3(normal);

        this.vertices.push(vert[a]);
        this.normals.push(normal);
        this.vertices.push(vert[b]);
        this.normals.push(normal);
        this.vertices.push(vert[c]);
        this.normals.push(normal);
        this.vertices.push(vert[a]);
        this.normals.push(normal);
        this.vertices.push(vert[c]);
        this.normals.push(normal);
        this.vertices.push(vert[d]);
        this.normals.push(normal);
    }
}

export default Cube;
