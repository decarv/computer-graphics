// ========================================================
// Rotinas auxiares
// Serão movidas para um arquivo webglUtils.js
// ========================================================
/**
 * cria o programa WebGL
 * @param {Obj} gl - contexto WebGL
 * @param {String} gsVertexShaderSrc - fonte do V Shader
 * @param {String} gsFragmentShaderSrc - fonte do F Shader
 * @returns - programa
 * 
 * Baseado em: https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
 */
export function makeProgram(gl, gsVertexShaderSrc, gsFragmentShaderSrc) {
  // Compilar e linkar os shaders
  var vertexShader = compile(gl, gl.VERTEX_SHADER, gsVertexShaderSrc);
  var fragmentShader = compile(gl, gl.FRAGMENT_SHADER, gsFragmentShaderSrc);
  var program = link(gl, vertexShader, fragmentShader);
  if (program) {
    return program;
  }
  alert("ERRO: na criação do programa.");
}

// ========================================================
/**
 * compila um shader
 * @param {Obj} gl - contexto WebGL
 * @param {*} type - gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER
 * @param {*} source - código fonte
 * @returns - codigo compilado
 */
export function compile(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var deuCerto = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (deuCerto) {
    return shader;
  }
  // mostra o erro
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader); // limpa antes de sair
}

// ========================================================
/**
 * monta (liga ou linka?) o programa
 * @param {Obj} gl - contexto WebGL 
 * @param {*} vertexShader 
 * @param {*} fragmentShader 
 * @returns programa
 */
export function link(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var deuCerto = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (deuCerto) {
    return program;
  }

  console.log(gl.ProgramInfoLog(program));
  gl.deleteProgram(program); // limpa
}

// ========================================================
/**
 * recebe array de arrays (triangulo) de diferentes tipos
 * @param {Array} v 
 * @returns retorna um array 1D com float32
 * 
 * Do livro do Angel, "Interactive Computer Graphics".
 */
export function flatten(v) {
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