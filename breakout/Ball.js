import { windowHeight, windowWidth } from "../gameConstants.js";
import { primaryColor, backgroundColor } from "../jsStyle/colors.js";

export class Ball {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.height = 10;
    this.width = 10;
    this.ctx = ctx;
    this.velocityX =
      Math.random() < 0.5
        ? Math.random() * (1 - 0.7) + 0.7 * -1
        : Math.random() * (1 - 0.7) + 0.7;
    this.velocityY = 1;
    this.speed = 1;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = primaryColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  move(delta) {
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;

    if (this.x <= 0) {
      this.velocityX = this.speed;
    }

    if (this.x >= windowWidth - this.width) {
      this.velocityX = -this.speed;
    }

    if (this.y <= 0) {
      this.velocityY = this.speed;
    }

    if (this.y > windowHeight - this.height) {
      this.velocityY = -this.speed;
    }
  }
}
