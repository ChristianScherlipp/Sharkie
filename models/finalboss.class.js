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

    state = 'wander';
    followRange = 200;
    followExitRange = 250;
    attackRange = 100;
    attackExitRange = 130;
    verticalSightTolerance = 80;
    folloSpeedMultiplier = 2;
    attackSpeedMultuplier = 3.5;


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

    FINALBOSS_IMAGES_ATTACK = [
        './assets/img/2.Enemy/3.Final_Enemy/Attack/1.png',
        './assets/img/2.Enemy/3.Final_Enemy/Attack/2.png',
        './assets/img/2.Enemy/3.Final_Enemy/Attack/3.png',
        './assets/img/2.Enemy/3.Final_Enemy/Attack/4.png',
        './assets/img/2.Enemy/3.Final_Enemy/Attack/5.png',
        './assets/img/2.Enemy/3.Final_Enemy/Attack/6.png',
    ];

    constructor (x, y){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.loadImages(this.FINALBOSS_IMAGES_SWIM);
        this.loadImages(this.FINALBOSS_IMAGES_ATTACK);
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

    edgeDistanceTo(character){
        let charLeft = character.rX, charRight = character.rX + character.rW;
        let charTop = character.rY, charBottom = character.rY + character.rH;
        let bossLeft = this.rX, bossRight = this.rX + this.rW;
        let bossTop = this.rY, bossBottom = this.rY + this.rH;
        let dx = Math.max(charLeft - bossRight, bossLeft - charRight, 0);
        let dy = Math.max(charTop - bossBottom, bossTop - charBottom, 0);
        return Math.sqrt(dx * dx + dy *dy);
    }
    // Wird jeden Frame von World.update() aufgerufen.
    update(deltaTime, character){
        this.getRealFrame();

        if (character) {
            let inSight = this.isCharacterInSight(character);
            let distance = this.edgeDistanceTo(character)
            if (this.state !== 'attacking' && inSight && distance <= this.attackRange) {
                this.state = 'attacking';
            }else if (this.state === 'attacking' && (!inSight || distance > this.attackExitRange)) {
                this.state = inSight && distance <= this.followExitRange ? 'following' : 'wander';
            } else if (this.state === 'wander' && inSight && distance <= this.followRange) {
                this.state = 'following';
            }else if (this.state === 'following' && (!inSight || distance >= this.followExitRange)) {
                this.state = 'wander';
            }
        } else {
            this.state = 'wander';
        }

        if (this.state === 'wander') {
            this.directionChangeTimer += deltaTime;
            if (this.directionChangeTimer > this.directionChangeInterval) {
                this.pickRandomDirection();
            }
        } else {
            let dx = (character.x + character.width / 2) - (this.x + this.width / 2);
            let dy = (character.y + character.height / 2) - ( this.y +this.height / 2);
            let len = Math.sqrt(dx * dx + dy *dy) || 1;
            this.vx = dx / len;
            this.vy = dy / len;
        }
        let speedMultiplier = 1;
        if (this.state === 'following') speedMultiplier = this.folloSpeedMultiplier;
        if (this.state === 'attacking') speedMultiplier = this.attackSpeedMultuplier;

        let factor = deltaTime / (1000 / 120);
        this.x += this.vx * this.speed * speedMultiplier * factor;
        this.y += this.vy * this.speed * speedMultiplier * factor;
        if (this.x <= this.minX) { this.x = this.minX; this.vx = 1; }
        if (this.x >= this.maxX) { this.x = this.maxX; this.vx = -1; }
        if (this.y <= this.minY) { this.y = this.minY; this.vy = 1; }
        if (this.y >= this.maxY) { this.y = this.maxY; this.vy = -1; }
        if (this.vx < 0) { this.otherDirection = false; }
        else if (this.vx > 0) { this.otherDirection = true; }
        if (this.state === 'attacking') {
            this.animateImages(this.FINALBOSS_IMAGES_ATTACK, deltaTime, 100)
        } else {
            this.animateImages(this.FINALBOSS_IMAGES_SWIM, deltaTime, 150);
            this.animateImages(this.FINALBOSS_IMAGES_SWIM, deltaTime, 150);
        }
    }

    isCharacterInSight(character){
        let facingLeft = !this.otherDirection;
        let inFront = facingLeft 
            ? (character.x + character.width / 2) <= (this.x + this.width / 2)
            : (character.x + character.width / 2) >= (this.x + this.width / 2);

        let verticalDiff = Math.abs((character.y + character.height / 2) - ( this.y + this.height / 2));
        return inFront && verticalDiff <= this.verticalSightTolerance;
    }

}