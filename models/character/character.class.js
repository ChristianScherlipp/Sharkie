import { MovableObject } from "../core/movable-object.class.js";
import { CHARACTER_IMAGES } from "./character-images.js";
import { AudioHub } from "../audio/audio-hub.class.js";

export class Character extends MovableObject {
    showFrame = false;
    x = 20;
    y = 100;
    width = 250;
    height = 290;
    speed = 4;
    world;
    longIdleThreshold = 8000;
    idleTime = 0;
    lastAttackHit = false;

    knockbackActive = false;
    knockbackStartX = 0;
    knockbackStartY = 0;
    knockbackTargetX = 0;
    knockbackTargetY = 0;
    knockbackElapsed = 0;
    knockbackDuration = 200;

    offset = {
        top : 160,
        left : 60,
        right : 60,
        bottom : 80
    };

    isAttacking = false;
    attackFrame = 0;
    attackTimer = 0;
    attackFrameDuration = 100;
    justAttacked = false; 

    isFormingBubble = false;
    bubbleFrame = 0;
    bubbleTimer = 0;
    bubbleFrameDuration = 100;
    justFiredBubble = false;

    isFormingPoison = false;
    poisonFrame = 0;
    poisonTimer = 0;
    poisonFrameDuration = 100;
    justFiredPoison = false;

    autoSwimRight = false;

    isFrozen = false;
    showingConfusion = false;
    confusionFrame = 0;
    confusionTimer = 0;
    confusionFrameDuration = 200;
    confusionFrameCount = 4;

    lastHitByJellyfish = false;
    deathAnimationStarted = false;
    deathFrame = 0;
    deathStartY = 0;
    
    IMAGES_SWIM = CHARACTER_IMAGES.SWIM;
    IMAGES_DEAD = CHARACTER_IMAGES.DEAD;
    IMAGES_DEAD_ELECTRO = CHARACTER_IMAGES.DEAD_ELECTRO;
    IMAGES_HURT = CHARACTER_IMAGES.HURT;
    IMAGES_IDLE = CHARACTER_IMAGES.IDLE;
    IMAGES_LONG_IDLE = CHARACTER_IMAGES.LONG_IDLE;
    IMAGES_FIN_SLAP_ATTACK = CHARACTER_IMAGES.FIN_SLAP_ATTACK;
    IMAGES_BUBBLE_FORMATION = CHARACTER_IMAGES.BUBBLE_FORMATION;
    IMAGES_POISON_FORMATION = CHARACTER_IMAGES.POISON_FORMATION;

    /**
     * Creates a new Character instance.
     */
    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_DEAD_ELECTRO);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_FIN_SLAP_ATTACK);
        this.loadImages(this.IMAGES_BUBBLE_FORMATION);
        this.loadImages(this.IMAGES_POISON_FORMATION);
        this.getRealFrame();
    }

    /**
     * Applies a hit to hit.
     * @param {number} [damage=2] - Amount of damage to apply.
     */
    hit(damage = 2){
        super.hit(damage);
        AudioHub.playOne(AudioHub.HURT);
    }

    /**
     * Updates the object's state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime) {
        if (this.isFrozen) { this.updateConfusion(deltaTime); return; }
        if (this.isDead()) { this.playDeathAnimation(deltaTime); return; }
        if (this.autoSwimRight) { this.updateAutoSwim(deltaTime); return; }

        let isMoving = this.updateMovementAndCamera(deltaTime);
        this.updateMoveSound(isMoving);
        this.updateIdleTime(deltaTime, isMoving);

        if (this.updateAttack(deltaTime)) return;
        if (this.updateBubbleFormation(deltaTime)) return;
        if (this.updatePoisonFormation(deltaTime)) return;

        this.updateIdleAnimation(deltaTime, isMoving);
    }

    /**
     * Updates confusion.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateConfusion(deltaTime){
        if (!this.showingConfusion) return;
        this.confusionTimer += deltaTime;
        if (this.confusionTimer > this.confusionFrameDuration) {
            this.confusionTimer = 0;
            this.confusionFrame = (this.confusionFrame + 1) % this.confusionFrameCount;
        }
    }

    /**
     * Updates move sound.
     * @param {boolean} isMoving - Whether the character is currently moving.
     */
    updateMoveSound(isMoving){
        if (isMoving) {
            AudioHub.playIfNotRunning(AudioHub.MOVE);
        } else {
            AudioHub.stopOne(AudioHub.MOVE);
        }
    }

    /**
     * Updates auto swim.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateAutoSwim(deltaTime){
        let factor = deltaTime / (1000 / 60);
        this.x += this.speed * factor;
        this.otherDirection = false;
        this.getRealFrame();
        this.animationTimer += deltaTime;
        if (this.animationTimer > 150) {
            this.playAnimation(this.IMAGES_SWIM);
            this.animationTimer = 0;
        }
    }

    /**
     * Updates movement and camera.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {*} The computed result.
     */
    updateMovementAndCamera(deltaTime){
        let prevX = this.x, prevY = this.y;
        if (this.knockbackActive) {
            this.updateKnockback(deltaTime);
        } else {
            this.updateKeyboardMovement(deltaTime);
        }
        this.updateCamera();
        this.getRealFrame();
        this.blockMovementIfColliding(prevX, prevY);
        return this.isMovementKeyPressed();
    }

    /**
     * Updates knockback.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateKnockback(deltaTime){
        this.knockbackElapsed += deltaTime;
        let t = Math.min(this.knockbackElapsed / this.knockbackDuration, 1);
        let eased = 1 - Math.pow(1 - t, 3);
        this.x = this.knockbackStartX + (this.knockbackTargetX - this.knockbackStartX) * eased;
        this.y = this.knockbackStartY + (this.knockbackTargetY - this.knockbackStartY) * eased;
        if (t >= 1) this.knockbackActive = false;
    }

    /**
     * Updates keyboard movement.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateKeyboardMovement(deltaTime){
        let factor = deltaTime / (1000 / 60);
        this.handleHorizontalMovement(factor);
        this.handleVerticalMovement(factor);
    }

    /**
     * Handles horizontal movement.
     * @param {number} factor - Direction factor applied to the movement speed (1 or -1).
     */
    handleHorizontalMovement(factor){
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
            this.x += this.speed * factor;
            this.otherDirection = false;
            }
        if (this.world.keyboard.LEFT && this.x > this.world.level.level_start_x) {
            this.x -= this.speed * factor;
            this.otherDirection = true;
        }
    }

    /**
     * Handles vertical movement.
     * @param {number} factor - Direction factor applied to the movement speed (1 or -1).
     */
    handleVerticalMovement(factor){
        if (this.world.keyboard.UP && this.y > -130) {
            this.y -= this.speed * factor;
            this.acceleration = 0;
        }
        if (this.world.keyboard.DOWN && this.isAboveGround()) {
            this.y += this.speed * factor;
        }
    }

    /**
     * Updates camera.
     */
    updateCamera(){
        let canvasWidth = this.world.canvas.width;
        let followX = this.world.level.level_start_x + canvasWidth * 0.3;
        let cameraMax = -this.world.level.level_start_x;
        let cameraMin = canvasWidth - this.world.level.level_end_x;
        let desiredCamera = followX - this.x;
        let camera = Math.min(cameraMax, Math.max(cameraMin, desiredCamera));
        this.world.camera_x = Math.round(camera);
    }

    /**
     * Block movement if colliding.
     * @param {number} prevX - The character's X position before this frame's movement.
     * @param {number} prevY - The character's Y position before this frame's movement.
     */
    blockMovementIfColliding(prevX, prevY){
        let blockedByCoin = this.world.level.coins.some(coin => coin.blocksMovement && this.isColliding(coin));
        let net = this.world.level.net;
        let blockedByNet = net && net.blocksMovement && this.isColliding(net);
        if (blockedByCoin || blockedByNet) {
            this.x = prevX;
            this.y = prevY;
            this.getRealFrame();
        }
    }

    /**
     * Checks whether movement key pressed.
     * @returns {boolean} True if the condition holds, false otherwise.
     */
    isMovementKeyPressed(){
        let k = this.world.keyboard;
        return k.RIGHT || k.LEFT || k.UP || k.DOWN || k.E || k.SPACE || k.Q;
    }

    /**
     * Updates idle time.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {boolean} isMoving - Whether the character is currently moving.
     */
    updateIdleTime(deltaTime, isMoving){
        if (isMoving) {
            this.idleTime = 0;
        } else {
            this.idleTime += deltaTime;
        }
    }

    /**
     * Updates attack.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {*} The computed result.
     */
    updateAttack(deltaTime){
        if (this.world.keyboard.SPACE && !this.isAttacking && !this.isFormingBubble && !this.isFormingPoison) {
            this.startAttack();
        }
        if (!this.isAttacking) return false;
        this.advanceAttackFrame(deltaTime);
        return true;
    }

    /**
     * Starts attack.
     */
    startAttack(){
        this.isAttacking = true;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.img = this.imageCache[this.IMAGES_FIN_SLAP_ATTACK[0]];
        this.justAttacked = true;
        AudioHub.playOne(AudioHub.FIN_SLAP);
    }

    /**
     * Advances attack frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    advanceAttackFrame(deltaTime){
        this.attackTimer += deltaTime;
        if (this.attackTimer <= this.attackFrameDuration) return;
        this.attackTimer = 0;
        this.attackFrame++;
        if (!this.lastAttackHit && this.attackFrame >= 4 && this.attackFrame <= 6) {
            this.attackFrame = 7;
        }
        if (this.attackFrame >= this.IMAGES_FIN_SLAP_ATTACK.length) {
            this.isAttacking = false;
        } else {
            this.img = this.imageCache[this.IMAGES_FIN_SLAP_ATTACK[this.attackFrame]];
        }
    }

    /**
     * Updates bubble formation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {*} The computed result.
     */
    updateBubbleFormation(deltaTime){
        if (this.world.keyboard.E && !this.isFormingBubble && !this.isAttacking && !this.isFormingPoison) {
            this.startBubbleFormation();
        }
        if (!this.isFormingBubble) return false;
        this.advanceBubbleFrame(deltaTime);
        return true;
    }

    /**
     * Starts bubble formation.
     */
    startBubbleFormation(){
        this.isFormingBubble = true;
        this.bubbleFrame = 0;
        this.bubbleTimer = 0;
        this.img = this.imageCache[this.IMAGES_BUBBLE_FORMATION[0]];
        AudioHub.playOne(AudioHub.BUBBLE_LOAD);
    }

    /**
     * Advances bubble frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    advanceBubbleFrame(deltaTime){
        this.bubbleTimer += deltaTime;
        if (this.bubbleTimer <= this.bubbleFrameDuration) return;
        this.bubbleTimer = 0;
        this.bubbleFrame++;
        if (this.bubbleFrame >= this.IMAGES_BUBBLE_FORMATION.length) {
            this.isFormingBubble = false;
            this.justFiredBubble = true;
        } else {
            this.img = this.imageCache[this.IMAGES_BUBBLE_FORMATION[this.bubbleFrame]];
        }
    }

    /**
     * Updates poison formation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {*} The computed result.
     */
    updatePoisonFormation(deltaTime){
        let canStart = !this.isFormingPoison && !this.isAttacking && !this.isFormingBubble && this.world.collectedPoisons > 0;
        if (this.world.keyboard.Q && canStart) {
            this.startPoisonFormation();
        }
        if (!this.isFormingPoison) return false;
        this.advancePoisonFrame(deltaTime);
        return true;
    }

    /**
     * Starts poison formation.
     */
    startPoisonFormation(){
        this.isFormingPoison = true;
        this.poisonFrame = 0;
        this.poisonTimer = 0;
        this.img = this.imageCache[this.IMAGES_POISON_FORMATION[0]];
        AudioHub.playOne(AudioHub.BUBBLE_LOAD);
    }

    /**
     * Advances poison frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    advancePoisonFrame(deltaTime){
        this.poisonTimer += deltaTime;
        if (this.poisonTimer <= this.poisonFrameDuration) return;
        this.poisonTimer = 0;
        this.poisonFrame++;
        if (this.poisonFrame >= this.IMAGES_POISON_FORMATION.length) {
            this.isFormingPoison = false;
            this.justFiredPoison = true;
        } else {
            this.img = this.imageCache[this.IMAGES_POISON_FORMATION[this.poisonFrame]];
        }
    }

    /**
     * Updates idle animation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {boolean} isMoving - Whether the character is currently moving.
     */
    updateIdleAnimation(deltaTime, isMoving){
        this.animationTimer += deltaTime;
        if (this.animationTimer <= 150) return;
        this.animationTimer = 0;
        if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (isMoving) {
            this.playAnimation(this.IMAGES_SWIM);
        } else if (this.idleTime > this.longIdleThreshold) {
            this.playAnimation(this.IMAGES_LONG_IDLE);
            let prevY = this.y;
            this.applyGravity(deltaTime);
            this.blockMovementIfColliding(this.x, prevY);
        } else {
            this.playAnimation(this.IMAGES_IDLE);
        }
    }

    /**
     * Plays death animation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    playDeathAnimation(deltaTime){
        if (!this.deathAnimationStarted) {
            this.deathAnimationStarted = true;
            this.deathFrame = 0;
            this.dieTimer = 0;
            this.deathStartY = this.y;
        }

        let images = this.lastHitByJellyfish ? this.IMAGES_DEAD_ELECTRO : this.IMAGES_DEAD;
        this.advanceDeathFrame(deltaTime, images);
        this.img = this.imageCache[images[this.deathFrame]];
        this.sinkToFloorIfElectro(images);
    }

    /**
     * Advances death frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     */
    advanceDeathFrame(deltaTime, images){
        this.dieTimer += deltaTime;
        if (this.dieTimer <= this.dieFrameDuration) return;
        this.dieTimer = 0;
        if (this.deathFrame < images.length - 1) {
            this.deathFrame++;
        } else {
            this.markedForRemoval = true;
        }
    }

    /**
     * Moves to floor if electro.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     */
    sinkToFloorIfElectro(images){
        if (!this.lastHitByJellyfish || this.deathFrame < 6) return;
        let floorY = 480 - this.height;
        let progress = (this.deathFrame - 6) / (images.length - 1 - 6);
        this.y = this.deathStartY + (floorY - this.deathStartY) * progress;
        this.getRealFrame();
    }
}