# EP4 - Simulação de Vôo

## 1. INTRODUÇÃO

Estes arquivos contêm a extensão do anterior simulador de vôo para adicionar reflexão e luz, segundo o Modelo de Phong.
A cena é iniciada com objetos ao redor de uma fonte de luz branca e pontual. 3 naves foram postas no mesmo nível da luz, com a nave que cuja câmera é a inicial,
mais distante para permitir a visualização de toda a cena.

O mouse agora pode ser usado para controlar a Starship.


### 1.1. Comentários sobre o simulador
Este simulador utiliza classes para criar a lógica da simulação (Engine), da starship (Starship), dos objetos (Shape, Cube e Sphere) e da fonte de Luz (LightSource).
A classe Engine é responsável por gerar a Starship e as Shapes e gerenciar a simulação, guardar seu estado e controlar seu tempo. Os inputs do usuário são passados ao Engine, que os encaminha 
para processamento pela Starship. O movimento da Starship considera sua posição, sua direção e sua velocidade (representada por um vetor). A aceleração da Starship é realizada sempre na direção 
para a qual ela aponta, de modo que seu movimento inercial é mantido até que a aeronave acelere em alguma direção ou seja parada por completo. A classe Shape é responsável por gerar as matrizes de
transformações dos objetos. As classes Cube e Sphere guardam os modelos iniciais dessas formas geométricas e estendem a classe Shape.

As formas são definidas no arquivo engine.js. Cada forma é criada por meio da chamada da classe com métodos que representam as transformações que eu realizo sobre a forma. As
transformações podem ser `rotate(ângulos)`, `scale(fatores)`, `translate(ponto)` e `animate(params)`, esta última representando a rotação durante a animação e as demais são estáticas, a partir do
referencial do ponto (0, 0, 0). Ou seja, animate irá estabelecer os parâmetros da animação, que são as velocidades de rotação em cada eixo. Durante a chamada de `shape.transform` em `engine.update`,
um novo modelo será criado dentro do javascript e será passado ao GLSL para renderização.

A fonte de luz foi desenhada com shaders diferentes para não sofrer efeitos de reflexão impostos pelo shader que renderiza as demais formas.

### 1.2. Organização
O código está organizado em 3 diretórios, com a estrutura a seguir:

├── css
│   └── ep04.css
├── LEIAME.md
├── lib
│   ├── models
│   ├── MVnew.js
│   ├── shaders
│   │   ├── light_source.frag
│   │   ├── light_source.vert
│   │   ├── spaceship.frag
│   │   └── spaceship.vert
│   ├── utils.js
│   ├── vec3.js
│   └── webglUtils.js
└── webpage
    ├── cube.js
    ├── engine.js
    ├── ep4.js
    ├── index.html
    ├── lightSource.js
    ├── shape.js
    ├── sphere.js
    └── starship.js


### 1.3. Execução
Para executar o programa, primeiro é preciso extrair todos os arquivos para um diretório e servir o diretório em localhost.

De dentro do diretório:

    $ python3 -m http.server

Depois, acessar a página index.html pelo browser:

    localhost:8000/webpapage/

### 1.4. Comandos
Os comandos seguem os comandos descritos no vídeo, e não no enunciado do EP. Os comandos da starship são:
- Pitch: pitch é realizado pelas teclas W e X. Essas teclas incrementam e decrementam a rotação no eixo x. W faz o nariz da starship descer e X faz o nariz subir.
- Yaw: yaw é realizado pelas teclas A e D. Essas teclas incrementam e decrementam a rotação no eixo y. A faz a starship virar para a esquerda e D para a direita.
- Roll: roll é realizado pelas teclas Z e C. Essas teclas incrementam e decrementam a rotação no eixo z. Z faz a starship girar no sentido horário e C no sentido anti-horário.
- Acelerar: Teclas L, K e J. L acelera na direção para onde aponta a starship. J acelera na direção contrária para onde aponta a starship. K zera a velocidade.
- Criação de naves: Tecla + pode ser usada para adicionar uma nave em um local aleatório.
- Mudança de naves: Teclas M e N podem ser usadas para mudar de uma nave para a outra.
- Controle por mouse: Ao apertar CTRL, Pitch e Yaw também podem ser controlados pelo movimento do mouse. A sensibilidade é bem alta e o fato de a câmera não ser fixada resulta em um Roll que fica difícil de controlar.

### 1.5. Botões
O botão Executar/Pausar executa ou pausa a animação e o botão Passo avança a animação em aproximadamente 10 frames.

## 2. HORAS DEDICADAS
Dia 10 de Julho:
Início 17h
Fim 00h

Dia 11 de Julho
Início 12h
Fim 17h

Total de 10 horas.

## 3. DIFICULDADES
A maior dificuldade envolveu cálculo de normais no cubo. Isso resultava em alguns bugs que foram difíceis de debugar.

## 4. BUGS
Nenhum bug conhecido.

## 5. AUTOR
Henrique de Carvalho
11819104
