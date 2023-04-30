import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from "./playerStates.js";
import { CollisionAnimation } from "./collisionAnimation.js";
import { FloatingMessages } from "./floatingMessages.js";


export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.vy = 0;
        this.weight = 1.3;
        this.image = player; // NEW FEATURE -> document.getElementById("player")
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.maxSpeed = 3;
        this.states = [
            new Sitting(this.game),
            new Running(this.game),
            new Jumping(this.game),
            new Falling(this.game),
            new Rolling(this.game),
            new Diving(this.game),
            new Hit(this.game),
        ];
        this.currentState = null;
        // Sounds effects
        this.sfx = {
            push: new Howl({
                src: ["https://assets.codepen.io/21542/howler-push.mp3"],
            }),
            boost: new Howl({
                src: ["https://assets.codepen.io/21542/howler-sfx-levelup.mp3"],
                loop: false,
                onend: function () {
                    console.log("Done playing sfx!");
                },
            }),
        };
    }
    update(input, deltaTime) {
        this.checkCollision();
        this.currentState.handleInput(input);

        // Horizontal movement
        this.x += this.speed;
        if (input.includes("ArrowRight") && this.currentState !== this.states[6]) this.speed = this.maxSpeed;
        else if (input.includes("ArrowLeft") && this.currentState !== this.states[6]) this.speed = -this.maxSpeed;
        else this.speed = 0;

        // Horizontal boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
        }

        // Vertical movement
        this.y += this.vy;
        if (!this.onGround()) this.vy += this.weight;
        else this.vy = 0;

        // Vertical boundaries
        if (this.y > this.game.height - this.height - this.game.groundMargin)
            this.y = this.game.height - this.height - this.game.groundMargin;

        //Sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    setState(state, speed) {
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter();
    }
    checkCollision() {
        this.game.enemies.forEach((enemy) => {
            if (
                enemy.x < this.x + this.width &&
                enemy.x + enemy.width > this.x &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y
            ) {
                // Collision detected
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                    this.game.player.playSound("boost", 100);
                    this.game.score++;
                    this.game.floatingMessages.push(new FloatingMessages("+1", enemy.x, enemy.y, 150, 50));
                } else {
                    this.game.player.playSound("push");
                    this.setState(6, 0);
                    this.game.score -= 5;
                    this.game.lives--;
                    if (this.game.lives <= 0) this.game.gameOver = true;
                }
            }
        });
    }

    playSound(type = "push", duration = 600) {
        if (this.game.sounds.includes("pushing")) {
            return;
        }

        this.sfx[type].play();
        this.game.sounds.push("pushing");
        setTimeout(() => {
            const el = this.game.sounds.indexOf("pushing");
            this.game.sounds.splice(el, 1);
        }, duration);
    }
}
