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

    /**
     * Creates a new MovableObject instance.
     */
    constructor() {
        super();
    }

    /**
     * Gets real frame
     */
    getRealFrame(){
            this.rX = this.x + this.offset.left;
            this.rY = this.y + this.offset.top;
            this.rW = this.width - this.offset.left - this.offset.right;
            this.rH = this.height - this.offset.top - this.offset.bottom;
    }

    /**
     * Moves right.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    moveRight(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x += this.speed * factor;  
        this.getRealFrame();
    }

    /**
     * Moves left.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    moveLeft(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x -= this.speed *factor;
        this.getRealFrame();
    }

    /**
     * Moves up.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    moveUp(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speed * factor;
        this.getRealFrame();
    }

    /**
     * Moves down.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    moveDown(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y += this.speed * factor;
        this.getRealFrame();
    }

    /**
     * Plays animation.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     */
    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Animates images.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {number} interval - Time between animation frames, in milliseconds.
     */
    animateImages(images, deltaTime, interval){
        this.animationTimer += deltaTime;
        if (this.animationTimer > interval) {
            this.playAnimation(images);
            this.animationTimer = 0;
        }
    }

    /**
     * Applies gravity.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    applyGravity(deltaTime){
        if (this.isAboveGround()) {
            let factor = deltaTime / (1000 / 120);
            this.y -= this.speedY * factor;
            this.speedY -= this.acceleration * factor; 
            this.getRealFrame();
        }
    }

    /**
     * Applies anti gravity.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    applyAntiGravity(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speedY * factor;
        this.speedY += this.acceleration * factor; 
        this.getRealFrame();
    }

    /**
     * Checks whether above ground.
     * @returns {boolean} - True if the condition holds, false therwise.
     */
    isAboveGround(){
        return this.y < 240;
    }

    /**
     * Checks whether colliding.
     * @param {MovableObject} mo - The other moable object to compare against.
     * @returns {boolean} - True if the condition holds, false therwise.
     */
    isColliding(mo){
        return this.rX + this.rW > mo.rX &&
            this.rY + this.rH > mo.rY &&
            this.rX < mo.rX + mo.rW &&
            this.rY < mo.rY + mo.rH;
    }

    /**
     * Checks whether blocked by obstacle.
     * @param {Level} level - the current level, containing enemies, coins and bounds.
     * @returns {boolean} - true if the contition holds, false otherwise.
     */
    isBlockedByObstacle(level){
        return !!(level && level.coins && level.coins.some(obj => obj.blocksMovement && this.isColliding(obj)));
    }

    /**
     * Checks whether at left level bound.
     * @param {Level} level - the current level, containing enemies, coins and bounds.
     * @returns {boolean} - true if the contition holds, false otherwise.
     */
    isAtLeftLevelBound(level){
        return !!(level && this.x <= level.level_start_x);
    }

    /**
     * Checks whether at right level bound.
     * @param {Level} level - the current level, containing enemies, coins and bounds.
     * @returns {boolean} - true if the contition holds, false otherwise.
     */
    isAtRightLevelBound(level){
        return !!(level && this.x + this.width >= level.level_end_x);
    }

    /**
     * Checks whether near.
     * @param {MovableObject} mo - the other movable object to compare against.
     * @param {number} range - Maximum distance counted as "near", in pixels.
     * @returns {boolean} - True if the condition holds, false otherwise.
     */
    isNear(mo, range = 30){
        return this.rX + this.rW + range > mo.rX &&
            this.rY + this.rH + range > mo.rY &&
            this.rX - range < mo.rX + mo.rW &&
            this.rY - range < mo.rY + mo.rH;
    }

    /**
     * Edge distance to.
     * @param {MovableObject} other - The other movable object to measure the distance to.
     * @returns {boolean} The computed result.
     */
    edgeDistanceTo(other){
        if (!other) return Infinity;
        let dx = Math.max(other.rX - (this.rX + this.rW), this.rX - (other.rX + other.rW), 0);
        let dy = Math.max(other.rY - (this.rY + this.rH), this.rY - (other.rY + other.rH), 0);
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Applies a hit to hit.
     * @param {number} [damage=2] - Amount of damage to apply.
     */
    hit(damage = 2){
        this.energy -= damage;
        if(this.energy < 0){
            this.energy = 0;
        }else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Checks whether hurt.
     * @returns {boolean} - True if the condition holds, false otherwise.
     */
    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    /**
     * Checks whether dead.
     * @returns {boolean}. - True if the condition holds, false otherwise
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Starts dying.
     */
    startDying() {
        this.isDying = true;
        this.dieFrame = 0;
        this.dieTimer = 0;
    }

    /**
     * Udates dying.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     */
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

    /**
     * Updates the object#s state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime){
        // absichtlich leer(default no+op)
    }
}