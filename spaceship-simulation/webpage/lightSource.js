import {vec3as4, vec4} from "../lib/MVnew.js";
import Sphere from "./sphere.js";


class LightSource {
    constructor(pos, Ie = null, Id = null, Is = null) {
        this.pos = vec4(...pos, 1.0); // posição
        this.La = vec4(0.3, 0.3, 0.3, 1.0); // ambiente
        this.Ld = vec4(0.8, 0.8, 0.8, 1.0); // difusão
        this.Ls = vec4(0.8, 0.8, 0.8, 1.0); // especular
        this.model = new Sphere(null, 0).scale([5, 5, 5]).translate(pos).transform(0, 0);
    }
}

export default LightSource;