import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from "./enemies.js";
import { UI } from "./UI.js";

window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 40;
            this.speed = 0;
            this.maxSpeed = 3;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.sounds = [];
            this.maxParticles = 200;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.winningScore = 35;
            this.fontColor = "black";
            this.time = 0;
            this.maxTime = 35000;
            this.gameOver = false;
            this.lives = 6;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.sfx = {
                backgroundSound: new Howl({ src: ["https://assets.codepen.io/21542/howler-demo-bg-music.mp3"] }),
            };
        }
        update(deltaTime) {
            this.time += deltaTime;
            if (this.time > this.maxTime) this.gameOver = true;
            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            // Handle enemies
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach((enemy) => {
                enemy.update(deltaTime);
            });
            // Handle Messages
            this.floatingMessages.forEach((message) => {
                message.update();
            });
            // Handle particles
            this.particles.forEach((particle) => {
                particle.update();
            });
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }

            // Handle collision sprites
            this.collisions.forEach((collision) => {
                collision.update(deltaTime);
            });

            this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
            this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
            this.collisions = this.collisions.filter((collision) => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter((message) => !message.markedForDeletion);
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach((enemy) => {
                enemy.draw(context);
            });
            this.particles.forEach((particle) => {
                particle.draw(context);
            });
            this.collisions.forEach((collision) => {
                collision.draw(context);
            });
            this.floatingMessages.forEach((message) => {
                message.draw(context);
            });
            this.UI.draw(context);
        }

        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));
        }

        playSound(type = "backgroundSound", duration = 600) {
            if (game.sounds.includes("pushing")) {
                return;
            }

            this.sfx[type].play();
            game.sounds.push("pushing");
            setTimeout(() => {
                const el = game.sounds.indexOf("pushing");
                game.sounds.splice(el, 1);
            }, duration);
        }

        showRetryBtn() {
            const btn = btn_retry;
            btn.style.display = "block";
            // Restart the game Temporary method
            btn.addEventListener("click", () => {
                location.reload();
            });
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver) requestAnimationFrame(animate);
        else game.showRetryBtn();
    }
    game.playSound("backgroundSound");
    animate(0);
});
