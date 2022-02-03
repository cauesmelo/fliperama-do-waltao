// Constantes gerais
const primaryColor = "#093d1a";
const backgroundColor = "#000000";
const windowHeight = 320;
const windowWidth = 480;

// ====Código compartilhado
// Estado geral
let selectedGame = "Breakout";
let isGameOver = false;
let isGameWin = false;
let isGameStarted = false;
let score = 0;

// Handler de game select
const handleChangeGame = (game) => (selectedGame = game);

// Pega canvas e contexto
const canvas = document.getElementById("gameCanvas");
canvas.width = windowWidth;
canvas.height = windowHeight;
const ctx = canvas.getContext("2d");

// Helper para escrita em tela
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

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    if (this.checkCollisionWithPaddle()) {
      this.velocityY *= -1;
      this.increaseVelocity();
      return;
    }

    this.checkCollisionWithBricks();

    if (this.x <= 0) {
      this.velocityX *= -1;
    }

    if (this.x >= windowWidth - this.width) {
      this.velocityX *= -1;
    }

    if (this.y <= 0) {
      this.velocityY *= -1;
    }

    if (this.y > windowHeight - this.height) {
      isGameOver = true;
    }
  }

  checkCollisionWithPaddle() {
    if (this.x >= paddle.x && this.x <= paddle.x + paddle.width) {
      if (this.y >= paddle.y - this.height) {
        return true;
      }
    }
  }

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

            if (bricks.brickCount === 0) isGameWin = true;
          }
        }
      }
    }
  }

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

  // Desenha o Paddle na tela
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

// ===Classe de brick
class Bricks {
  constructor() {
    this.rows = 3;
    this.columns = 5;
    this.width = 70;
    this.height = 20;
    this.bricks = [];
    this.brickCount = 15;

    for (let c = 0; c < this.columns; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.bricks[c][r] = { x: 0, y: 0 };
      }
    }
  }

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
  } else {
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

// ===Game loop
const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  calculateDeltaTime();

  switch (selectedGame) {
    case "Breakout":
      breakoutGameLoop();
      break;
    case "Corona Invaders":
      // TODO
      break;
    case "Snake":
      // TODO
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
