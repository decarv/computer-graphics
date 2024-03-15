/* utils.js - Funções auxiliares para meus programas
 *
 * Referências:
 *  webglUtils.js
 *  https://webgl2fundamentals.org
 *  http://learnwebgl.brown37.net
 *
 */

export { angleDifference, getRandomAngle, getRandomCoordinates, fetchShaderSource, createShader, createProgram, flatten , FlatBuffer, makeBuffer, setAttribute, randomColor };

function angleDifference(angle1, angle2) {
    let da = angle1 - angle2;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    return da;
}

function getRandomAngle() {
  return Math.random() * Math.PI * 2;
}

function getRandomCoordinates(canvasWidth, canvasHeight) {
  const x = Math.random() * canvasWidth;
  const y = Math.random() * canvasHeight;
  return { x, y };
}

function randomColor() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    const a = 1.0;
    return [r, g, b, a]
}

async function fetchShaderSource(url) {
    let response = await fetch(url);
    return await response.text();
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error(`Erro de compilação do shader ${type}.`);
}

function createProgram(gl, vertexShader, fragmentShader, transformFeedbackVaryings=[]) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // ref.: https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html
    if (transformFeedbackVaryings.length > 0) {
        gl.transformFeedbackVaryings(
            program,
            transformFeedbackVaryings,
            gl.SEPARATE_ATTRIBS
        )
    }

    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    // webgl2fundamentals suggestion is:
    // throw new Error(gl.getProgramParameter(program));
    // TODO: does this delete the program?
}

/**
 * recebe array de arrays (triangulo) de diferentes tipos
 * @param {Array} v
 * @returns retorna um array 1D com float32
 *
 * Do livro do Angel, "Interactive Computer Graphics".
 */
function flatten(v) {
    // será que v é um array?
    if (!Array.isArray(v)) return v;

    // se for 1D transforma para float32
    if (typeof (v[0]) == 'number') {
        let floats = new Float32Array(v.length);

        for (let i = 0; i < v.length; i++)
            floats[i] = v[i];

        return floats;
    }

    // transforma para 1D de floats32
    let floats = new Float32Array(v.length * v[0].length);

    for (let i = 0; i < v.length; i++) for (var j = 0; j < v[0].length; j++) {
        floats[i * v[0].length + j] = v[i][j];
    }

    return floats;
}

class FlatBuffer {
    constructor(size = 4) {
        this.data = new Float32Array(size);
        this.size = size;
        this.ptr = 0;
    }

    push(new_data) {
        let prev_ptr = this.ptr;
        let flattenedData = this.flatten(new_data);
        if (flattenedData.length + this.ptr >= this.size) {
            this.resize();
        }
        this.data.set(flattenedData, this.ptr);
        this.ptr += flattenedData.length;
        return prev_ptr;
    }

    resize(requiredSize) {
        while (this.size <= requiredSize) {
            this.size *= 2;
        }
        let tmp = new Float32Array(this.size);
        tmp.set(this.data);
        this.data = tmp;
    }

    set(ptr, data) {
        data = this.flatten(data);
        const lastPos= ptr + data.length - 1;
        if (lastPos>= this.size) {
            this.resize(lastPos);
        }
        for (let i = 0; i < data.length; i++) {
            this.data[ptr+i] = data[i];
        }
        return ptr + data.length;
    }
    
    flatten(arr) {
        return [].concat(...arr.map(item => (Array.isArray(item) ? this.flatten(item) : item)));
    }
}

// Ref.: http://learnwebgl.brown37.net/rendering/buffer_object_primer.html
// This reserves a new id for a new buffer.
function makeBuffer(gl, data, target=gl.ARRAY_BUFFER) {
    let buffer = gl.createBuffer();
    if (buffer) {
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, gl.DYNAMIC_DRAW);
    } else {
        console.error("Error creating buffer object.");
    }
    return buffer;
}

function setAttribute(gl, attributeLocation, attributes) {
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(
        attributeLocation,
        attributes.size,
        attributes.datatype,
        attributes.normalize,
        attributes.stride,
        attributes.offset
    );
}

function pickRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


