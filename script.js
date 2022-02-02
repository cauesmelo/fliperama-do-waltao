// Importa classe da bola
import { Ball } from "./breakout/Ball.js";
import { Paddle } from "./breakout/Paddle.js";

// Cores
import {
  primaryColor,
  backgroundColor,
  windowHeight,
  windowWidth,
} from "./gameConstants.js";

// Pega canvas e contexto
const canvas = document.getElementById("breakout");
const ctx = canvas.getContext("2d");

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
    case "Space":
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
    case "Space":
      spacePressed = false;
      break;
  }
};

// Cria listeners para os controles
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Cria objetos
const ball = new Ball(180, 160, ctx);
const paddle = new Paddle(windowWidth / 2, windowHeight - 10, ctx);

// Função para calcular delta time
const calculateDeltaTime = () => {
  let now = Date.now();
  deltaTime = (now - lastUpdate) / 10;
  lastUpdate = now;
};

// Game loop
const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  calculateDeltaTime();

  if (rightPressed) {
    paddle.moveRight(deltaTime);
  }

  if (leftPressed) {
    paddle.moveLeft(deltaTime);
  }

  ball.move(deltaTime);
  ball.draw();
  paddle.draw();
};

// Configura game loop para rodar a 60fps
setInterval(gameLoop, 16.66);
