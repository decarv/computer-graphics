

/* Classe auxiliar para vec4 */
class vec3 {
    constructor(x, y, z, h) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.h = h; // Coordenada homogênea
    }

    sum(other) {
        console.assert(other instanceof vec3 && (other.h.isVec() || other.h.isPoint()));
        return new vec3(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
            this.h + other.h,
        )
    }

    dot(other) {
        console.assert(other instanceof vec3 && other.h.isVec());
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    product(other) {
        console.assert(other instanceof vec3 && other.h.isVec());
        throw new Error("Não implementado.")
    }

    angle(other) {
        console.assert(other instanceof vec3 && other.h.isVec());
        return Math.acos(this.cosine(other));
    }

    cosine(other) {
        console.assert(other instanceof vec3 && other.h.isVec());
        return this.dot(other) / (this.mod() * other.mod());
    }

    mod() {
        console.assert(this.h.isVec());
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    isVec() {
        return this.h === 0;
    }

    isPoint() {
        return this.h === 1;
    }

    toBuffer() {
        throw new Error("Não implementado.")
    }
}