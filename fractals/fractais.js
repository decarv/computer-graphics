/* ==================================================
    fractais.js

    Nome: Henrique de Carvalho
    NUSP: 11819104

    Ao preencher esse cabeçalho com o meu nome e o meu número USP,
    declaro que todas as partes originais desse exercício programa (EP)
    foram desenvolvidas e implementadas por mim e que, portanto, não
    constituem desonestidade acadêmica ou plágio.
    Declaro também que sou responsável por todas as cópias desse
    programa e que não distribui ou facilitei a sua distribuição.
    Estou ciente que os casos de plágio e desonestidade acadêmica
    serão tratados segundo os critérios divulgados na página da
    disciplina.
    Entendo que EPs sem assinatura devem receber nota zero e, ainda
    assim, poderão ser punidos por desonestidade acadêmica.

    Abaixo descreva qualquer ajuda que você recebeu para fazer este
    EP. Inclua qualquer ajuda recebida por pessoas (inclusive
    monitores e colegas). Com exceção de material da disciplina, caso
    você tenha utilizado alguma informação, trecho de código,...
    indique esse fato abaixo para que o seu programa não seja
    considerado plágio ou irregular.

    Exemplo:

        A minha função quicksort() foi baseada na descrição encontrada na
        página https://www.ime.usp.br/~pf/algoritmos/aulas/quick.html.

    Descrição de ajuda ou indicação de fonte:
        Fontes:
         - https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
         - https://iwearshorts.com/blog/finding-a-pixel-in-canvas-image-data/
================================================== */


class Complex {
    /**
     * Construtor da classe Complex.
     * @param {number} x - Parte real do número complexo.
     * @param {number} y - Parte imaginária do número complexo.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    product(other) {
        const tmpX = this.x * other.x - this.y * other.y;
        const tmpY = this.y * other.x + this.x * other.y;
        this.x = tmpX;
        this.y = tmpY;
        return this
    }
    squaredMod() {
        return this.x * this.x + this.y * this.y;
    }
}

// A `main()` só deve ser executada quando tudo estiver carregado
window.onload = main;

// Constantes de desenho
const MAX_ITER = 100;
const THRESHOLD = 4;

// Variáveis de controle de teclas
const resetKey1 = 'r';
const resetKey2 = 'R';
let shiftPressed = false;
let mouseUpX, mouseUpY, mouseDownX, mouseDownY, mouseOverX, mouseOverY;

// Constantes e Variáveis de Julia-Fatou
const jfMIN_X = -1.5;
const jfMIN_Y = -1.5;
const jfMAX_X =  1.5;
const jfMAX_Y =  1.5;
let jfCX, jfCY;
let jfInitialHeight, jfFinalHeight;

// Constantes e Variáveis de Mandelbrot
let mMIN_X;
let mMIN_Y;
let mMAX_X;
let mMAX_Y;
let mInitialHeight;
let mFinalHeight;
let mPixelValuesMap;

// Variáveis para controle de animação
let rectRequestId;

// Lista de cores retirada de:
// https://www.w3schools.com/colors/colors_groups.asp
const CORES = [
    "#000000",
    "#5F9EA0",
    "#4682B4",
    "#B0C4DE",
    "#ADD8E6",
    "#B0E0E6",
    "#87CEFA",
    "#87CEEB",
    "#6495ED",
    "#00BFFF",
    "#1E90FF",
    "#4169E1",
    "#0000FF",
    "#0000CD",
    "#00008B",
    "#000080",
    "#191970",
];
const CORES_RGB = [
    { r: 0, g: 0, b: 0 },
    { r: 95, g: 158, b: 160 },
    { r: 70, g: 130, b: 180 },
    { r: 176, g: 196, b: 222 },
    { r: 173, g: 216, b: 230 },
    { r: 176, g: 224, b: 230 },
    { r: 135, g: 206, b: 250 },
    { r: 135, g: 206, b: 235 },
    { r: 100, g: 149, b: 237 },
    { r: 0, g: 191, b: 255 },
    { r: 30, g: 144, b: 255 },
    { r: 65, g: 105, b: 225 },
    { r: 0, g: 0, b: 255 },
    { r: 0, g: 0, b: 205 },
    { r: 0, g: 0, b: 139 },
    { r: 0, g: 0, b: 128 },
    { r: 25, g: 25, b: 112 },
];
const NCORES = CORES.length;

let gCanvas, gWidth, gHeight, gCtx;

// Objetos de ImageData para armazenar as imagens de Mandelbrot (m) e Julia-Fatou (jf). Com esses objetos, é possível
// manipular pixeis mais rapidamente que pintando retângulos 1x1.
let mImageData, jfImageData;

function main() {
    gCanvas = document.querySelector('#fractais_canvas');
    gWidth = gCanvas.width;
    gHeight = gCanvas.height/2;
    gCtx = gCanvas.getContext('2d');

    mImageData = gCtx.createImageData(gWidth, gHeight);
    jfImageData = gCtx.createImageData(gWidth, gHeight);

    mInitialHeight = 0;
    mFinalHeight = gHeight;
    jfInitialHeight = gHeight;
    jfFinalHeight = gHeight * 2;

    gCanvas.addEventListener('click', clickEvent);
    gCanvas.addEventListener('mousedown', mouseDownEvent);
    gCanvas.addEventListener('mouseup', mouseUpEvent);
    gCanvas.addEventListener("mousemove", mouseMoveEvent);
    document.addEventListener('keydown', keyDownEvent);
    document.addEventListener('keyup', keyUpEvent);

    // Inicializa as variáveis com os valores padrões e desenha as imagens.
    resetVariables();
    drawJuliaFatou();
    drawMandelbrot();
}

function keyUpEvent(event) {
    if (event.key === 'Shift') {
        shiftPressed = false;
        cancelAnimationFrame(rectRequestId);
    }
}

function keyDownEvent(event) {
    if (event.key === resetKey1 || event.key === resetKey2) {
        resetVariables();
        drawJuliaFatou();
        drawMandelbrot();
    } else if (event.key === 'Shift') {  // NOTE: event.Keycode === 16 is deprecated
        shiftPressed = true;
        // console.log("Shift Pressed")
    }
}

function clickEvent(event) {
    const rect = gCanvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    // Apenas considera os cliques na parte de cima do canvas.
    if (y < jfInitialHeight && !shiftPressed) {
        jfCX = jfMAX_X - (y / gWidth) * (jfMAX_X - jfMIN_X);
        jfCY = jfMAX_Y - (x / gHeight) * (jfMAX_Y - jfMIN_Y);
        drawJuliaFatou();
    }
}

function mouseDownEvent(event) {
    // Apenas considera mouseDown se a tecla SHIFT estiver pressionada.
    if (shiftPressed) {
        const rect = gCanvas.getBoundingClientRect();
        mouseDownX = event.clientX - rect.left;
        mouseDownY = event.clientY - rect.top;
        mouseOverX = mouseDownX;
        mouseOverY = mouseDownY;
        animateRectangle();
    }
}

function mouseUpEvent(event) {
    // Cancela o retângulo de seleção em qualquer caso após soltar o botão
    cancelAnimationFrame(rectRequestId);

    // Se a tecla SHIFT não estiver pressionada, apenas apaga o retângulo.
    if (shiftPressed) {
        const rect = gCanvas.getBoundingClientRect();
        mouseUpX = event.clientX - rect.left;
        mouseUpY = event.clientY - rect.top;

        let minCoordX, maxCoordX;
        if (mouseUpX > mouseDownX) {
            minCoordX = mouseDownX;
            maxCoordX = mouseUpX;
        } else {
            minCoordX = mouseUpX;
            maxCoordX = mouseDownX;
        }

        let minCoordY, maxCoordY;
        if (mouseUpY > mouseDownY) {
            minCoordY = mouseDownY;
            maxCoordY = mouseUpY;
        } else {
            minCoordY = mouseUpY;
            maxCoordY = mouseDownY;
        }

        /* Um ponto p{x|y} (máximo ou mínimo) vai ser a solução do sistema:
         *   (coord{X|Y} / p{x|y} - min{X|Y}) = ({width|height}) / delta{X|Y}
         * Em que coord{X|Y} é a nova distância em pixeis no canvas. Ou seja,
         *   px = (coordX * deltaX) / width + minX
         *   py = (coordY * deltaY) / height + minY
         */
        let deltaX = mMAX_X - mMIN_X;
        let deltaY = mMAX_Y - mMIN_Y;
        let pMinX = mMIN_X + minCoordX * deltaX / gWidth;
        let pMaxX = mMIN_X + maxCoordX * deltaX / gWidth;
        let pMinY = mMIN_Y + minCoordY * deltaY / gHeight;
        let pMaxY = mMIN_Y + maxCoordY * deltaY / gHeight;
        mMIN_X = pMinX;
        mMAX_X = pMaxX;
        mMIN_Y = pMinY;
        mMAX_Y = pMaxY;

        drawMandelbrot();
    } else {
        // Evita que o SHIFT seja liberado e o retângulo permaneça no canvas
        gCtx.clearRect(0, 0, gWidth, gHeight);
        gCtx.putImageData(mImageData, 0, 0);
    }
}

function mouseMoveEvent(event) {
    mouseOverX = event.clientX - gCanvas.offsetLeft;
    mouseOverY = event.clientY - gCanvas.offsetTop;

    // Evita que retângulo de seleção seja desenhado sobre imagem de Julia-Fatou.
    if (mouseOverY >= gHeight) {
        mouseOverY = gHeight-1;
    }

    // Evita que o retângulo simplesmente suma dentro do canvas.
    if (mouseOverX >= gWidth) {
        mouseOverX = gWidth-1;
    }

    // Se o SHIFT não estiver pressionado, cancela animação do retângulo.
    if (!shiftPressed) {
        cancelAnimationFrame(rectRequestId);
    }
}

function animateRectangle() {
    gCtx.clearRect(0, 0, gWidth, gHeight);
    gCtx.putImageData(mImageData, 0, 0);
    drawRectangle(mouseDownX, mouseDownY,mouseOverX-mouseDownX, mouseOverY-mouseDownY);
    rectRequestId = window.requestAnimationFrame(animateRectangle);
}

function drawRectangle(x, y, w, h) {
    gCtx.strokeStyle = "red";
    gCtx.lineWidth = 2;
    gCtx.setLineDash([5, 5]);
    gCtx.strokeRect(x, y, w, h);
}

function resetVariables() {
    jfCX = -0.62;
    jfCY = -0.44;
    mMIN_X = -2.2;
    mMIN_Y = -1.5;
    mMAX_X =  0.8;
    mMAX_Y =  1.5;
}

/**
 * Desenha o conjunto de Mandelbrot.
 * O conjunto de Mandelbrot é desenhado na janela de visualização do plano complexo definida pelas variáveis mMIN_X,
 * mMAX_X, mMIN_Y e mMAX_Y.
 *
 *  Comentário:
 *   Antes as imagens eram atualizadas a partir de um mapa de cores, as imagens eram desenhadas por
 *   meio de `fillRect`, mas isso era muito demorado.
 *   A forma de desenho foi substituída por `putImageData`.
 *
 *   ```
 *   colorMap = Array(gHeight).fill().map(()=>Array(gWidth).fill());
 *   function drawImageFromColorMap(colorMap) {
 *       for (let x = 0; x < colorMap[0].length; x++) {
 *           for (let y = 0; y < colorMap.length; y++) {
 *               gCtx.fillStyle = colorMap[x][y];
 *               gCtx.fillRect = (x, y, 1, 1);
 *           }
 *       }
 *   }```
 * @returns {void}
 */
function drawMandelbrot() {
    mPixelValuesMap = defineComplexAxisMap(gWidth, gHeight, mMIN_X, mMAX_X, mMIN_Y, mMAX_Y);
    calculateMandelbrotImageData();
    gCtx.putImageData(mImageData, 0, 0);
}

/**
 * Cria uma matriz de complexos que mapeia as coordenadas do plano complexo para as coordenadas dos pixels de uma
 * imagem. Cada índice (x, y) possui seu correspondente complexo pixelMap[x][y].
 * É utilizada para criar as duas imagens, Mandelbrot e Julia-Fatou.
 *
 * @param {number} w - A largura da imagem em pixels.
 * @param {number} h - A altura da imagem em pixels.
 * @param {number} xMin - O valor mínimo do eixo X do plano complexo.
 * @param {number} xMax - O valor máximo do eixo X do plano complexo.
 * @param {number} yMin - O valor mínimo do eixo Y do plano complexo.
 * @param {number} yMax - O valor máximo do eixo Y do plano complexo.
 * @returns {Array<Array<Complex>>} - Matriz de complexos que mapeia as coordenadas do plano complexo para as
 *  coordenadas dos pixels da imagem.
 */
function defineComplexAxisMap(w, h, xMin, xMax, yMin, yMax) {
    let pixelMap = [];
    for (let x = 0; x <= w; x++) {
        pixelMap.push([]);
        for (let y = 0; y <= h; y++) {
            let c = new Complex((x / w) * (xMax - xMin) + xMin,(y / h) * (yMax - yMin) + yMin);
            pixelMap[x].push(c);
        }
    }
    return pixelMap;
}

/**
 * Calcula os dados da imagem do conjunto de Mandelbrot.
 *
 * Essa função percorre todos os pixels da imagem e determina a cor de cada pixel
 * com base na quantidade de iterações necessárias para que o número complexo
 * correspondente saia do conjunto de Mandelbrot.
 * @returns: void
 */
function calculateMandelbrotImageData() {
    for (let x = 0; x < gWidth; x++) {
        for (let y = 0; y < gHeight; y++) {
            let cx = mPixelValuesMap[x][y].x;
            let cy = mPixelValuesMap[x][y].y;
            let complexNumber = new Complex(0, 0);
            let complexConstant = new Complex(cx, cy);
            let k;
            for (k = 0; k < MAX_ITER && complexNumber.squaredMod() < THRESHOLD; k++) {
                complexNumber = complexNumber.product(complexNumber).add(complexConstant);
            }
            if (k >= MAX_ITER) k = 0;

            let color = CORES_RGB[k % NCORES];

            // Calcula o índice no objeto de dados da imagem:
            // (linhas percorridas (y * w) + posição da linha (x)) * 4 pixeis
            let index = (x + y * gWidth) * 4;

            // Atribui um valor de cor para um pixel.
            mImageData.data[index] = color.r;
            mImageData.data[index + 1] = color.g;
            mImageData.data[index + 2] = color.b;
            mImageData.data[index + 3] = 255; // 255 apenas funciona.
        }
    }
}

/**
 * Desenha o conjunto de Julia-Fatou.
 * O conjunto de Julia-Fatou é desenhado na janela de visualização do plano complexo definida pelas variáveis jfMIN_X,
 * jfMAX_X, jfMIN_Y e jfMAX_Y.
 * @returns: void
 */
function drawJuliaFatou() {
    const complexConstant = new Complex(jfCX, jfCY);

    const BACKGROUND_COLOR = CORES_RGB[0];
    const FOREGROUND_COLOR = CORES_RGB[2]

    // Inicializa os dados da imagem com a cor de FOREGROUND. Pinta o plano inteiramente de FOREGROUND para depois pintar
    // apenas os pixeis que atingiram o limiar de BACKGROUND.
    let data = jfImageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = FOREGROUND_COLOR.r;
        data[i+1] = FOREGROUND_COLOR.g;
        data[i+2] = FOREGROUND_COLOR.b;
        data[i+3] = 255;
    }

    let jfPixelValuesMap = defineComplexAxisMap(gWidth, gHeight, jfMIN_X, jfMAX_X, jfMIN_Y, jfMAX_Y);
    for (let x = 0; x < gWidth; x++) {
        for (let y = jfInitialHeight; y < jfFinalHeight; y++) {
            let complexNumber = jfPixelValuesMap[x][y-jfInitialHeight];
            for (let k = 0; k < MAX_ITER; k++) {
                // Se o módulo ao quadrado do número complexo for maior ou igual ao THRESHOLD,
                // define a cor de fundo para o pixel e sai do loop.
                if (complexNumber.squaredMod() >= THRESHOLD) {
                    let i = (x + (y-jfInitialHeight) * gWidth) * 4;
                    data[i] = BACKGROUND_COLOR.r;
                    data[i+1] = BACKGROUND_COLOR.g;
                    data[i+2] = BACKGROUND_COLOR.b;
                    data[i+3] = 255;
                    break;
                }
                complexNumber = complexNumber.product(complexNumber).add(complexConstant);
            }
        }
        gCtx.putImageData(jfImageData, 0, jfInitialHeight);
    }
}

/**
 *
 *  ######################################################  FIM  ######################################################
 */