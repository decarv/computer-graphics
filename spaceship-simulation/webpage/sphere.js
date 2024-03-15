"use strict";
import {mix, normalize, subtract, vec3} from "../lib/MVnew.js"
import Shape from "./shape.js";
import {randomColor} from "../lib/utils.js";

class Sphere extends Shape {
  constructor(colors = null, alpha = 30.0) {
    super(alpha);

    if (colors === null) {
      this.color_a = randomColor();
      this.color_b = randomColor();
      this.color_c = randomColor();
    } else {
      this.color_a = colors;
      this.color_b = colors;
      this.color_c = colors;
    }

    this.createSphere();
  }

  createSphere(nDivisions = 3) {
    let vp = [
      vec3(1.0, 0.0, 0.0),
      vec3(0.0, 1.0, 0.0),
      vec3(0.0, 0.0, 1.0),
    ];

    let vn = [
      vec3(-1.0, 0.0, 0.0),
      vec3(0.0, -1.0, 0.0),
      vec3(0.0, 0.0, -1.0),
    ];

    let triangle = [
        [vp[0], vp[1], vp[2]],
        [vp[0], vp[1], vn[2]],

        [vp[0], vn[1], vp[2]],
        [vp[0], vn[1], vn[2]],

        [vn[0], vp[1], vp[2]],
        [vn[0], vp[1], vn[2]],

        [vn[0], vn[1], vp[2]],
        [vn[0], vn[1], vn[2]],
    ];

    for (let i = 0; i < triangle.length; i++) {
      let a, b, c;
      [a, b, c] = triangle[i];
      this.divideTriangle(a, b, c, nDivisions);
    }
  };

    divideTriangle(a, b, c, ndivs) {
      if (ndivs > 0) {
        let ab = mix(a, b, 0.5);
        let bc = mix(b, c, 0.5);
        let ca = mix(c, a, 0.5);

        ab = normalize(ab);
        bc = normalize(bc);
        ca = normalize(ca);

        this.divideTriangle(a, ab, ca, ndivs - 1);
        this.divideTriangle(b, bc, ab, ndivs - 1);
        this.divideTriangle(c, ca, bc, ndivs - 1);
        this.divideTriangle(ab, bc, ca, ndivs - 1);
      }
      else {
        this.insertTriangle(a, b, c);
      }
    };

    insertTriangle(a, b, c) {
      this.vertices.push(a);
      this.vertices.push(b);
      this.vertices.push(c);
      this.C.d.push(this.color_a);
      this.C.d.push(this.color_b);
      this.C.d.push(this.color_c);
    }

    calculateNormals() {
      this.normals = []
      for (const v of this.model) {
        this.normals.push(subtract(v, vec3(...this.pos)));
      }
    }
}

export default Sphere;