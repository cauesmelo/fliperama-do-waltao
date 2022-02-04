// ========= PREFACIO ===========
// O jogo funciona dentro de um loop eterno(função denominada gameLoop),
// que executa, a limpeza de tela, lógica do jogo e desenho de todos os
// elementos no jogo a cada 16.66 milisegundos, gerando um total de
// aproximadamente 60frames por segundo.
//
// Nesse ciclo de vida de 1 frame o gameloop vai:
// 1. Limpar a tela, ou seja, apaga tudo que estiver desenhado na tela
// 2. Executar uma lógica de jogo, ou seja, se estiver selecionado "snake",
//    ele checa se a cobra precisa ser movida, se sim, ajusta o x e y dela,
//    checa as colisões, e realiza qualquer outro ajuste de variável necessária.
// 3. Por fim, com as variáveis atualizadas, ele desenha todos os elementos na
//    tela.
//
// O que foi feito aqui foram 5 jogos distintos, utilizando javascript puro,
// utilizando o elemento HTML Canvas, a gente consegue desenhar elementos na
// na tela, e com o setInterval conseguimos realizar a temporização do gameloop.
// =============================

// Constantes gerais
const primaryColor = "#093d1a";
const backgroundColor = "#000000";
const windowHeight = 320;
const windowWidth = 480;

// ====Código compartilhado
// Estado geral
let selectedGame = "Corona Invaders";
let isGameOver = false;
let isGameWin = false;
let isGameStarted = false;
let score = 0;

// Handler de game select
const handleChangeGame = (game) => {
  selectedGame = game;
  titleText.innerText = game;
  isGameOver = false;
  isGameWin = false;
  isGameStarted = false;
  score = 0;

  // Da blur nos botões html para evitar que a tecla espaço ative eles novamente
  document.querySelectorAll("button").forEach((b) => b.blur());
};

// Pega canvas, contexto e header de titulo
const canvas = document.getElementById("gameCanvas");
canvas.width = windowWidth;
canvas.height = windowHeight;
const ctx = canvas.getContext("2d");
const titleText = document.getElementById("gameTitle");

// Helpers para escrita em tela
const write = (text, x, y, fontSize) => {
  if (fontSize) {
    ctx.font = `${fontSize}px 'Press Start 2P'`;
  }
  ctx.fillText(text, x, y);
  ctx.font = "12px 'Press Start 2P'";
};

const writeLeft = (text, x, y, fontSize) => {
  ctx.textAlign = "left";
  if (fontSize) {
    ctx.font = `${fontSize}px 'Press Start 2P'`;
  }
  ctx.fillText(text, x, y);
  ctx.font = "12px 'Press Start 2P'";
  ctx.textAlign = "center";
};

// Configurações padrão para escrita em tela
ctx.font = "12px 'Press Start 2P'";
ctx.fillStyle = primaryColor;
ctx.textAlign = "center";

// Guarda tempo para calcular o delta time
let lastUpdate = Date.now();
let deltaTime = 0;

// Controles
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;

// Funções para tratar inputs
const keyDownHandler = (e) => {
  switch (e.key) {
    case "ArrowRight":
    case "Right":
      rightPressed = true;
      break;
    case "Left":
    case "ArrowLeft":
      leftPressed = true;
      break;
    case "Up":
    case "ArrowUp":
      upPressed = true;
      break;
    case "Down":
    case "ArrowDown":
      downPressed = true;
      break;
    case " ":
      spacePressed = true;
      break;
  }
};

const keyUpHandler = (e) => {
  switch (e.key) {
    case "Right":
    case "ArrowRight":
      rightPressed = false;
      break;
    case "Left":
    case "ArrowLeft":
      leftPressed = false;
      break;
    case "Up":
    case "ArrowUp":
      upPressed = false;
      break;
    case "Down":
    case "ArrowDown":
      downPressed = false;
      break;
    case " ":
      spacePressed = false;
      break;
  }
};

// Cria listeners para os controles
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Helper de RNG
const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomBoolean = () => Math.random() > 0.5;

// Função para calcular delta time
const calculateDeltaTime = () => {
  let now = Date.now();
  deltaTime = (now - lastUpdate) / 10;
  lastUpdate = now;
};

// =======BREAKOUT CODE
// ===Classe da bolinha
class Ball {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.height = 10;
    this.width = 10;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  // desenha bolota na tela
  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
  }

  // move bolota na tela
  move() {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Checa e trata as colisões
    this.checkCollisionWithPaddle();
    this.checkCollisionWithBricks();

    // aqui é caso bater nos limites da tela, jogamos a bolinha no lado oposto
    if (this.x <= 0) {
      this.velocityX *= -1;
    }

    if (this.x >= windowWidth - this.width) {
      this.velocityX *= -1;
    }

    if (this.y <= 0) {
      this.velocityY *= -1;
    }

    // se bater no chão, é game over playboy
    if (this.y > windowHeight - this.height) {
      isGameOver = true;
    }
  }

  // se colidir com raquete, joga pra cima e aumenta velocidade
  checkCollisionWithPaddle() {
    if (this.x >= paddle.x && this.x <= paddle.x + paddle.width) {
      if (this.y >= paddle.y - this.height) {
        this.velocityY *= -1;
        this.increaseVelocity();
        return true;
      }
    }
  }

  // se colidir com os tijolinhos, anota como destruido, aumenta escore
  // e joga bolota na velocidade oposta
  checkCollisionWithBricks() {
    for (var c = 0; c < bricks.columns; c++) {
      for (var r = 0; r < bricks.rows; r++) {
        var b = bricks.bricks[c][r];
        if (!b.destroyed) {
          if (
            this.x > b.x &&
            this.x < b.x + bricks.width &&
            this.y > b.y &&
            this.y < b.y + bricks.height
          ) {
            this.velocityY *= -1;
            b.destroyed = true;
            score += 10;
            bricks.brickCount--;

            // se não sobrar mais tijolinhos, é game win baby
            if (bricks.brickCount === 0) isGameWin = true;
          }
        }
      }
    }
  }

  // função para aumentar velocidade da bolota
  increaseVelocity() {
    this.velocityX += this.velocityX > 0 ? 0.1 : -0.1;
    this.velocityY += this.velocityY > 0 ? 0.1 : -0.1;
  }

  // Seta posição da bolinha manualmente
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Lança a bolinha
  launch() {
    isGameStarted = true;
    this.velocityY = -1;

    // Se o botão da direita tiver pressionado, lança pra direita
    // Se não, se o botão da esquerda tiver presssionado, lança pra esquerda
    // Se não, lança aleatoriamente para um dos lados
    this.velocityX = rightPressed
      ? Math.random() * (1 - 0.7) + 0.7
      : leftPressed
      ? Math.random() * (1 - 0.7) + 0.7 * -1
      : Math.random() < 0.5
      ? Math.random() * (1 - 0.7) + 0.7 * -1
      : Math.random() * (1 - 0.7) + 0.7;
  }
}

// ===Classe da raquete
class Paddle {
  constructor() {
    this.x = windowWidth / 2;
    this.y = windowHeight - 10;
    this.height = 10;
    this.width = 70;
  }

  // Desenha a raquete na tela
  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
  }

  // Move para esquerda, sempre multiplicando pela delta time para
  // não haver diferença de velocidade com mudança de fps
  moveLeft() {
    if (this.x > 0) this.x -= 5 * deltaTime;
  }

  // Move para direita
  moveRight() {
    if (this.x < windowWidth - this.width) this.x += 5 * deltaTime;
  }
}

// ===Classe de bloquinhos
class Bricks {
  constructor() {
    this.rows = 3;
    this.columns = 5;
    this.width = 70;
    this.height = 20;
    this.bricks = [];
    this.brickCount = 15;

    // cria um array de bloquinhos
    for (let c = 0; c < this.columns; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.bricks[c][r] = { x: 0, y: 0 };
      }
    }
  }

  // função de desenho
  // itera pelo array de bloquinhos e vai desenhando eles na tela
  draw() {
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (!this.bricks[c][r].destroyed) {
          let brickX = c * (this.width + 10) + 45;
          let brickY = r * (this.height + 10) + 40;
          this.bricks[c][r].x = brickX;
          this.bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, this.width, this.height);
          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
}

// Cria objetos
let ball = new Ball();
let paddle = new Paddle();
let bricks = new Bricks();

// reinicia as variaveis do jogo
const restartBreakout = () => {
  paddle = new Paddle();
  bricks = new Bricks();
  score = 0;
  spacePressed = false;
  isGameOver = false;
  isGameStarted = false;
  isGameWin = false;
};

// Gameloop do breakout
const breakoutGameLoop = () => {
  // se game over, moostra mensagem e da opcao para restartar
  if (isGameOver) {
    write("Você perdeu :(", canvas.width / 2, canvas.height / 2, 16);
    write(
      "Pressione espaço para reiniciar",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    if (spacePressed) {
      restartBreakout();
    }

    // se game win, mostra mensagem e da opção para restartar
  } else if (isGameWin) {
    write("Você ganhou! :D", canvas.width / 2, canvas.height / 2, 16);
    write(
      "Pressione espaço para jogar novamente",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    if (spacePressed) {
      restartBreakout();
    }

    // se não, roda a lógica de jogo
  } else {
    if (!isGameStarted) {
      write(
        "Pressione espaço para começar",
        canvas.width / 2,
        canvas.height / 2,
        12
      );
      bricks = new Bricks();
    }

    if (rightPressed) {
      paddle.moveRight();
    }

    if (leftPressed) {
      paddle.moveLeft();
    }

    if (isGameStarted) {
      ball.move();
    } else {
      ball.setPosition(paddle.x + paddle.width / 2 - 5, paddle.y - 10);
      if (spacePressed) {
        ball.launch();
      }
    }

    ball.draw();
    paddle.draw();
    bricks.draw();
  }

  writeLeft("Score:" + score, 10, 30, 15);
};

// =======SNAKE CODE
// Snake constants
const maxWidthGridSnake = 45;
const maxHeightGridSnake = 25;

class Apple {
  // iniciamos nossa maça em uma coordenada aleatoria
  constructor() {
    this.x = randomBetween(0, maxWidthGridSnake);
    this.y = randomBetween(0, maxHeightGridSnake);
  }

  // desenhamos nossa bela maça
  draw() {
    ctx.beginPath();
    ctx.rect(this.x * 10 + 10, this.y * 10 + 50, 10, 10);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
    console.log("123", this.x, this.y);
  }
}

// Classe da cobrinha
class Snake {
  constructor() {
    // guardamos aqui a cabeça
    this.x = 5;
    this.y = 5;

    // Aqui é uma flag para sabermos quando a cobrinha está crescendo ou não
    this.hasToGrow = false;

    // e o corpinho salvamos em um array
    this.body = [
      { x: 5, y: 4 },
      { x: 5, y: 3 },
    ];

    // aqui é para qual eixo a cobrinha vai se movimentar
    this.velocityX = 0;
    this.velocityY = 1;

    // guardamos a ultima velocidade para que ela nao volte em direção ao seu
    // corpinho
    this.lastVelocityX = 0;
    this.lastVelocityY = 1;
  }

  draw() {
    // desenhamos a cabeça da cobrinha
    ctx.beginPath();
    ctx.rect(this.x * 10 + 10, this.y * 10 + 50, 10, 10);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();

    // iteramos pelo corpinho desenhando cada segmento
    this.body.forEach((corpinho) => {
      ctx.beginPath();
      ctx.rect(corpinho.x * 10 + 10, corpinho.y * 10 + 50, 10, 10);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.closePath();
    });
  }

  // move a cobrinha na tela
  move() {
    // guardamos as coordenadas para saber para onde devemos movimentar
    // cada segmento do corpinho
    let tempCoordinates = {
      x: this.x,
      y: this.y,
    };

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.lastVelocityX = this.velocityX;
    this.lastVelocityY = this.velocityY;

    // checagem de colisão com a tela
    this.checkCollisionWithScreen();

    // checagem de colisao com a maça
    this.checkCollisionWithApple();

    // checagem de colisao com o corpinho
    this.checkCollisionWithSelf();

    // movemos cada parte do corpinho e guardamos a posição para saber
    // onde devemos posicionar o próximo
    this.body.forEach((corpinho) => {
      let tempX = corpinho.x;
      let tempY = corpinho.y;

      corpinho.x = tempCoordinates.x;
      corpinho.y = tempCoordinates.y;

      tempCoordinates = {
        x: tempX,
        y: tempY,
      };
    });

    // Se a cobrinha precisar crescer, ou seja, comeu uma maçã
    // adicionamos um corpinho na posição do rabinho
    if (this.hasToGrow) {
      this.body.push(tempCoordinates);
      this.hasToGrow = false;
    }
  }

  // Checa e trata as colisões
  checkCollisionWithScreen() {
    if (
      this.x > maxWidthGridSnake ||
      this.x < 0 ||
      this.y < 0 ||
      this.y > maxHeightGridSnake
    ) {
      isGameOver = true;
    }
  }

  checkCollisionWithApple() {
    if (apple.x === this.x && apple.y === this.y) {
      score += 10;
      apple.x = randomBetween(0, maxWidthGridSnake);
      apple.y = randomBetween(0, maxHeightGridSnake);
      this.hasToGrow = true;
    }
  }

  checkCollisionWithSelf() {
    // se as coordenadas do corpinho foram as mesmas que a cabeça
    // game over baby
    this.body.forEach((corpinho) => {
      if (corpinho.x === this.x && corpinho.y === this.y) {
        isGameOver = true;
      }
    });
  }

  // Função para sabermos de uma nova velocidade é valida para a cobrinha
  isNewVelocityValid(x, y) {
    if (x !== this.lastVelocityX && y !== this.lastVelocityY) return true;
  }
}

// Função para tratar os comandos para cobrinha
const handleSnakeInput = () => {
  if (leftPressed && snake.isNewVelocityValid(-1, 0)) {
    snake.velocityX = -1;
    snake.velocityY = 0;
  }

  if (upPressed && snake.isNewVelocityValid(0, -1)) {
    snake.velocityX = 0;
    snake.velocityY = -1;
  }

  if (rightPressed && snake.isNewVelocityValid(1, 0)) {
    snake.velocityX = 1;
    snake.velocityY = 0;
  }

  if (downPressed && snake.isNewVelocityValid(0, 1)) {
    snake.velocityX = 0;
    snake.velocityY = 1;
  }
};

// cria objetos
let snake = new Snake();
let apple = new Apple();

// Desenho de jaula, score
const drawSnakeScenario = () => {
  ctx.beginPath();
  ctx.rect(10, 50, windowWidth - 20, windowHeight - 60);
  ctx.strokeStyle = primaryColor;
  ctx.stroke();
  ctx.closePath();

  if (isGameStarted && !isGameOver) apple.draw();

  writeLeft("Score:" + score, 15, 35, 15);
};

// Guardamos tempo passado para saber quando atualizar nossa querida cobrinha
let timePassed = 0;

// função para reiniciar o jogo
const restartSnake = () => {
  snake = new Snake();
  score = 0;
  spacePressed = false;
  isGameOver = false;
  isGameStarted = true;
  isGameWin = false;
};

// loop do jogo da cobrinha
const snakeGameLoop = () => {
  drawSnakeScenario();
  timePassed += deltaTime;

  // se game over, monta tela de gameover
  if (isGameOver) {
    write("Você perdeu :(", canvas.width / 2, canvas.height / 2, 16);
    write(
      "Pressione espaço para reiniciar",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    if (spacePressed) {
      restartSnake();
    }

    // se game nao começou, monta tela de inicio de jogo
  } else if (!isGameStarted) {
    write("Pressione espaço para iniciar", canvas.width / 2, canvas.height / 2);

    if (spacePressed) {
      restartSnake();
    }

    // se nao, eh game on baby
  } else {
    handleSnakeInput();

    if (timePassed > 20) {
      snake.move();
      timePassed = 0;
    }
    snake.draw();
  }
};

// =======CORONA INVADERS CODE
// Load assets
let coronaSprite = new Image();
let syringeSprite = new Image();
coronaSprite.src = "assets/coronga.png";
syringeSprite.src = "assets/syringe.png";

// Corona class
// Mantenha o distanciamento dessa classe e use máscara!
class Corona {
  constructor() {
    this.rows = 4;
    this.columns = 15;
    this.coronas = [];
    this.coronaCount = [];
    this.width = 16;
    this.height = 16;

    // Crio um array de covid, bem aglomerado do jeitinho q ele gosta
    for (let c = 0; c < this.columns; c++) {
      this.coronas[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.coronas[c][r] = { x: 0, y: 0 };
      }
    }
  }

  // a logica de desenho eh a mesma dos tijolinhos pro breakout
  // vou percorrendo por todos os covids e desenhado-os em tela
  draw() {
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (!this.coronas[c][r].destroyed) {
          let coronaX = c * (this.width + 10) + 50;
          let coronaY = r * (this.height + 10) + 30;
          this.coronas[c][r].x = coronaX;
          this.coronas[c][r].y = coronaY;
          ctx.drawImage(
            coronaSprite,
            coronaX,
            coronaY,
            this.width,
            this.height
          );
        }
      }
    }
  }
}

// VACINE-SE, TOME A DOSE DE REFORÇO ASSIM QUE POSSIVEL
// VACINAS SALVAM VIDAS
class Syringe {
  constructor() {
    this.x = windowWidth / 2;
    this.y = windowHeight - 42;
    this.height = 32;
    this.width = 32;
  }

  // Desenha a vacina na tela
  draw() {
    ctx.drawImage(syringeSprite, this.x, this.y, this.width, this.height);
  }

  // Move para esquerda, sempre multiplicando pela delta time para
  // não haver diferença de velocidade com mudança de fps
  moveLeft() {
    if (this.x > 0) this.x -= 5 * deltaTime;
  }

  // Move para direita
  moveRight() {
    if (this.x < windowWidth - this.width) this.x += 5 * deltaTime;
  }
}

// instancia objetos pro jogo
let coronas = new Corona();
let syringe = new Syringe();

// codigo para reiniciar o jogo
const restartCorona = () => {
  coronas = new Corona();
  syringe = new syringe();
  score = 0;
  spacePressed = false;
  isGameOver = false;
  isGameStarted = false;
  isGameWin = false;
};

const coronaGameLoop = () => {
  // se game over, moostra mensagem e da opcao para restartar
  if (isGameOver) {
    write("Você perdeu :(", canvas.width / 2, canvas.height / 2, 16);
    write(
      "Pressione espaço para reiniciar",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    if (spacePressed) {
      restartCorona();
    }

    // se game win, mostra mensagem e da opção para restartar
  } else if (isGameWin) {
    write("Você ganhou! :D", canvas.width / 2, canvas.height / 2, 16);
    write(
      "Pressione espaço para jogar novamente",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    if (spacePressed) {
      restartCorona();
    }

    // se não, roda a lógica de jogo
  } else {
    if (!isGameStarted) {
      write(
        "Pressione espaço para começar",
        canvas.width / 2,
        canvas.height / 2 + 30,
        12
      );
      coronas = new Corona();
    }

    if (rightPressed) {
      syringe.moveRight();
    }

    if (leftPressed) {
      syringe.moveLeft();
    }

    if (isGameStarted) {
      // TODO
    }

    coronas.draw();
    syringe.draw();
  }

  writeLeft("Score:" + score, 10, 20, 12);
};

// =======PONG 360 CODE
// =======TIC TAC TOE CODE

// ===Game loop
const gameLoop = () => {
  // limpa tela e calcula delta time
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  calculateDeltaTime();

  // de acordo com o jogo selecionado, executa um game loop específico
  switch (selectedGame) {
    case "Breakout":
      breakoutGameLoop();
      break;
    case "Corona Invaders":
      coronaGameLoop();
      break;
    case "Snake":
      snakeGameLoop();
      break;
    case "Pong 360":
      // TODO
      break;
    case "TicTacToe":
      // TODO
      break;
  }
};

// Configura game loop para rodar a 60fps
setInterval(gameLoop, 16.66);
