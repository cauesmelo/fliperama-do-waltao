import {
  primaryColor,
  backgroundColor,
  windowWidth,
  windowHeight,
} from "../gameConstants.js";

export class Paddle {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.height = 10;
    this.width = 70;
    this.ctx = ctx;
  }

  // Desenha o Paddle na tela
  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = primaryColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  // Move para esquerda, sempre multiplicando pela delta time para
  // não haver diferença de velocidade com mudança de fps
  moveLeft(delta) {
    if (this.x > 0) this.x -= 5 * delta;
  }

  // Move para direita
  moveRight(delta) {
    if (this.x < windowWidth - this.width) this.x += 5 * delta;
  }
}
