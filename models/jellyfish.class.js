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
    
    /**
     * The 2 available skins. Only Lila and Yellow exist as calm-state
     * (Regular_damage) images - Green and Pink only exist for the
     * alert-state (Super_dangerous) images, so each calm color is paired
     * with one of those two alert colors instead of matching itself.
     */
    static SKINS = [
        { calm: 'Lila', dead: 'Lila', deadPrefix: 'L', alert: 'Pink' },
        { calm: 'Yellow', dead: 'Yellow', deadPrefix: 'y', alert: 'Green' },
    ];

    JELLY_IMAGES_SWIM;
    JELLY_IMAGES_DANGEROUS;
    JELLY_IMAGES_DIE;

    /**
     * Builds the swim/dangerous/die image paths for a given skin.
     * @param {number} skinIndex - Index into Jellyfish.SKINS.
     * @returns {{swim: Array<string>, dangerous: Array<string>, die: Array<string>}} Image path sets for this skin.
     */
    static buildImageSet(skinIndex) {
        let skin = Jellyfish.SKINS[skinIndex % Jellyfish.SKINS.length];
        let base = './assets/img/2.Enemy/2.Jelly_fish';
        return {
            swim: [1, 2, 3, 4].map(n => `${base}/Regular_damage/${skin.calm}${n}.png`),
            dangerous: [1, 2, 3, 4].map(n => `${base}/Super_dangerous/${skin.alert}${n}.png`),
            die: [1, 2, 3, 4].map(n => `${base}/Dead/${skin.dead}/${skin.deadPrefix}${n}.png`),
        };
    }

    minY;
    maxY;
    movingUp = true;

    static alertedCount = 0;

    /**
     * Creates a new Jellyfish instance
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} [strengthBonus=0] -Extra strength/health added on top of the base value. 
     * @param {number} [skinIndex=0] - Which of the 4 color skins to use, e.g. picked per level.
     */
    constructor(x, y, strengthBonus = 0, skinIndex = 0) {
        super();
        let images = Jellyfish.buildImageSet(skinIndex);
        this.JELLY_IMAGES_SWIM = images.swim;
        this.JELLY_IMAGES_DANGEROUS = images.dangerous;
        this.JELLY_IMAGES_DIE = images.die;
        this.loadImage(images.swim[0]);
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
        this.updateAlertState(distance, character, level);
        this.updateVerticalPatrol(deltaTime, level);
        this.updateSwimAnimation(deltaTime);
    }

    /**
     * Updates alert state.
     * @param {number} distance - Distance in pixels.
     * @param {Character} character - The player character.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    updateAlertState(distance, character, level){
        let characterBelow = character && (character.y + character.height / 2) > (this.y + this.height / 2);
        let visible = !characterBelow && this.hasLineOfSightTo(character, level);

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