import { MovableObject } from "./movable-object.class.js";

export class Finalboss extends MovableObject {
    showFrame = true;
    x = 3900;
    y = Math.random() * 300;
    width = 250;
    height = 220;
    minX = 5752;
    maxX = 7191 - 250;
    minY = 0;
    maxY = 480 - 220;
    vx = 0;
    vy = 0;
    directionChangeTimer = 0;
    directionChangeInterval = 3000;

    offset = {
        top : 80,
        left : 15,
        right : 20,
        bottom : 40
    };

    FINALBOSS_IMAGES_SWIM = [
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/2.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/3.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/4.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/5.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/6.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/7.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/8.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/9.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/10.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/11.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/12.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/13.png',
    ];

    constructor (x, y){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.loadImages(this.FINALBOSS_IMAGES_SWIM);
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.pickRandomDirection();
        this.getRealFrame();
    }

    pickRandomDirection(){
        const options = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        const choice = options[Math.floor(Math.random() * options.length)];
        this.vx = choice[0];
        this.vy = choice[1];
        this.directionChangeTimer = 0;
        this.directionChangeInterval = 3000 + Math.random() * 3000;
    }

    // Wird jeden Frame von World.update() aufgerufen.
    update(deltaTime){
        this.directionChangeTimer += deltaTime;
        if (this.directionChangeTimer > this.directionChangeInterval) {
            this.pickRandomDirection();
        }
        let factor = deltaTime / (1000 / 120);
        this.x += this.vx * this.speed * factor;
        this.y += this.vy * this.speed * factor;
        if (this.x <= this.minX) { this.x = this.minX; this.vx = 1; }
        if (this.x >= this.maxX) { this.x = this.maxX; this.vx = -1; }
        if (this.y <= this.minY) { this.y = this.minY; this.vy = 1; }
        if (this.y >= this.maxY) { this.y = this.maxY; this.vy = -1; }
        if (this.vx < 0) { this.otherDirection = false; }
        else if (this.vx > 0) { this.otherDirection = true; }
        this.getRealFrame();
        this.animateImages(this.FINALBOSS_IMAGES_SWIM, deltaTime, 150);
    }
}