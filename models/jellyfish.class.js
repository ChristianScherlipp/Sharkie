import { MovableObject } from "./movable-object.class.js";
import { AudioHub } from "./audio-hub.class.js";

export class Jellyfish extends MovableObject {
    showFrame = false;
    x = 190 + Math.random() * 2500;
    y = Math.random() * (480 - 180);
    width = 70;
    height = 120;
    damage = 2;
    health = 1;
    strengthBonus = 0;
    detectionRange = 100;
    exitRange = 130;
    isAlerted = false;
    knocksBack = true;
    knockbackDistance = 100;

    offset = {
        top : 25,
        left : 25,
        right : 25,
        bottom : 40
    };
    
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila4.png',
    ];

    JELLY_IMAGES_DANGEROUS = [
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink1.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink2.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink3.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink4.png',
    ];

    JELLY_IMAGES_DIE = [
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L1.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L2.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L3.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L4.png',
    ];

    minY;
    maxY;
    movingUp = true;

    static alertedCount = 0;

    /**
     * Creates a new Jellyfish instance
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} [strengthBonus=0] -Extra strength/health added on top of the base value. 
     */
    constructor(x, y, strengthBonus = 0) {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.loadImages(this.JELLY_IMAGES_DANGEROUS);
        this.loadImages(this.JELLY_IMAGES_DIE);
        this.speed = 0.15 +Math.random() * 0.5;
        this.x = x;
        this.y =y;
        this.strengthBonus = strengthBonus;
        this.health += strengthBonus;
        let canvasHeight = 480;
        let range = 50 + Math.random() * 5
        this.minY = Math.max(0, this.y - range);
        this.maxY = Math.min(canvasHeight - this.height, this.y + range);
        this.getRealFrame();
    }

    /**
     * Update the object#s state for the current frame.
     * @param {number} deltaTime 
     * @param {Character} character - the player character.
     * @param {level} level - The current level, containing enemies, coins and bounds.
     */
    update(deltaTime, character, level){
        if (this.isDying) {
            this.updateDying(deltaTime, this.JELLY_IMAGES_DIE);
            return;
        }

        let distance = this.edgeDistanceTo(character);
        this.updateAlertState(distance, character);
        this.updateVerticalPatrol(deltaTime, level);
        this.updateSwimAnimation(deltaTime);
    }

    /**
     * Updates alert state.
     * @param {number} distance - Distance in pixels.
     * @param {Character} character - The player character.
     */
    updateAlertState(distance, character){
        let characterBelow = character && (character.y + character.height / 2) > (this.y + this.height / 2);
        let visible = !characterBelow;

        if (!this.isAlerted && distance <= this.detectionRange && visible) {
            this.markAlerted();
        }else if (this.isAlerted && distance > this.exitRange) {
            this.markCalm();
        }
        this.damage = (this.isAlerted ? 5 : 2) + this.strengthBonus;
    }

    /**
     * Marks alerted.
     */
    markAlerted(){
        this.isAlerted = true;
        Jellyfish.alertedCount++;
        if (Jellyfish.alertedCount === 1){
        AudioHub.playOne(AudioHub.JELLYFISH_ELECTRO);
        }
    }

    /**
     * Marks calm.
     */
    markCalm() {
        this.isAlerted = false;
        Jellyfish.alertedCount = Math.max(0, Jellyfish.alertedCount - 1);
        if (Jellyfish.alertedCount === 0){
            AudioHub.stopOne(AudioHub.JELLYFISH_ELECTRO);
        }
    }

    /**
     * Starts dying
     */
    startDying(){
        if (this.isAlerted) this.markCalm();
        super.startDying();
    }

    /**
     * Update vertical patrol.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {level} level - The current level, containing enemies, coins and bounds.
     */
    updateVerticalPatrol(deltaTime, level){
        if (this.movingUp) {
            this.moveUp(deltaTime);
            this.checkPatrolTurn(level, this.minY, true);
        } else {
            this.moveDown(deltaTime);
            this.checkPatrolTurn(level, this.maxY, false);
        }
    }

    /**
     * Checks patrol turn.
     * @param {level} level - The current level, containing enemies, coins and bounds.
     * @param {number} boundaryY - Y position of the patrol boundary.
     * @param {boolean} isMovingUp - Whether the entity is moving upward.
     */
    checkPatrolTurn(level, boundaryY, isMovingUp){
        let reachedBoundary = isMovingUp ? this.y <= boundaryY : this.y >= boundaryY;
        if (!reachedBoundary && !this.isBlockedByObstacle(level)) return;

        let overshotUp = isMovingUp && this.y < boundaryY;
        let overshotDown = !isMovingUp && this.y > boundaryY;
        if (overshotUp || overshotDown) this.y = boundaryY;

        this.movingUp = !isMovingUp;
        this.getRealFrame();
    }

    /**
     * Updates swim animation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateSwimAnimation(deltaTime){
        if (this.isAlerted) {
            this.animateImages(this.JELLY_IMAGES_DANGEROUS, deltaTime, 200);
        } else {
            this.animateImages(this.JELLY_IMAGES_SWIM, deltaTime, 255);
        }
    }
}