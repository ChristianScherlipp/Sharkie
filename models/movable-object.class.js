import { DrawableObject } from "./drawable-object.class.js";

export class MovableObject extends DrawableObject {
    speed = 0.15;
    speedY = 0;
    acceleration = 0.002;
    
    otherDirection = false;
    energy = 100;
    lastHit = 0;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 0,
        left : 0,
        right : 0,
        bottom : 0
    };

    animationTimer = 0;

    isDying = false;
    dieFrame = 0;
    dieTimer = 0;
    dieFrameDuration = 150;
    markedForRemoval = false;

    constructor() {
        super();
    }

    getRealFrame(){
            this.rX = this.x + this.offset.left;
            this.rY = this.y + this.offset.top;
            this.rW = this.width - this.offset.left - this.offset.right;
            this.rH = this.height - this.offset.top - this.offset.bottom;
    }

    moveRight(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x += this.speed * factor;  
        this.getRealFrame();
    }

    moveLeft(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x -= this.speed *factor;
        this.getRealFrame();
    }

    moveUp(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speed * factor;
        this.getRealFrame();
    }

    moveDown(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y += this.speed * factor;
        this.getRealFrame();
    }

    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    animateImages(images, deltaTime, interval){
        this.animationTimer += deltaTime;
        if (this.animationTimer > interval) {
            this.playAnimation(images);
            this.animationTimer = 0;
        }
    }

    applyGravity(deltaTime){
        if (this.isAboveGround()) {
            let factor = deltaTime / (1000 / 120);
            this.y -= this.speedY * factor;
            this.speedY -= this.acceleration * factor; 
            this.getRealFrame();
        }
    }

    applyAntiGravity(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speedY * factor;
        this.speedY += this.acceleration * factor; 
        this.getRealFrame();
    }

    isAboveGround(){
        return this.y < 240;
    }

    isColliding(mo){
        return this.rX + this.rW > mo.rX &&
            this.rY + this.rH > mo.rY &&
            this.rX < mo.rX + mo.rW &&
            this.rY < mo.rY + mo.rH;
    }

    isBlockedByObstacle(level){
        return !!(level && level.coins && level.coins.some(obj => obj.blocksMovement && this.isColliding(obj)));
    }

    isAtLeftLevelBound(level){
        return !!(level && this.x <= level.level_start_x);
    }

    isAtRightLevelBound(level){
        return !!(level && this.x + this.width >= level.level_end_x);
    }

    isNear(mo, range = 30){
        return this.rX + this.rW + range > mo.rX &&
            this.rY + this.rH + range > mo.rY &&
            this.rX - range < mo.rX + mo.rW &&
            this.rY - range < mo.rY + mo.rH;
    }

    edgeDistanceTo(other){
        if (!other) return Infinity;
        let dx = Math.max(other.rX - (this.rX + this.rW), this.rX - (other.rX + other.rW), 0);
        let dy = Math.max(other.rY - (this.rY + this.rH), this.rY - (other.rY + other.rH), 0);
        return Math.sqrt(dx * dx + dy * dy);
    }

    hit(damage = 2){
        this.energy -= damage;
        if(this.energy < 0){
            this.energy = 0;
        }else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    isDead() {
        return this.energy == 0;
    }

    startDying() {
        this.isDying = true;
        this.dieFrame = 0;
        this.dieTimer = 0;
    }

    updateDying(deltaTime, images) {
        this.dieTimer += deltaTime;
        if (this.dieTimer > this.dieFrameDuration) {
            this.dieTimer = 0;
            this.dieFrame++;
            if (this.dieFrame >= images.length) {
                this.markedForRemoval = true;
            } else {
                this.img = this.imageCache[images[this.dieFrame]];
            }
        }
    }

    update(deltaTime){
        // absichtlich leer(default no+op)
    }
}