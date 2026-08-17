import { MovableObject } from "./movable-object.class.js";

export class Pufferfish extends MovableObject {
    showFrame = false;
    x = 200 + Math.random() * 2500;
    y = Math.random() * 450;
    width = 140;
    height = 110;
    health = 2;
    damage = 2;
    strengthBonus = 0;
    detectionRange = 100;
    exitRange = 130;
    alertState = 'idle';
    transitionFrame = 0;
    transitionTimer = 0;
    transitionFrameDuration = 100;
    chargeDeadzone = 20;
    chargeDirectionLeft = true;
    
    chargeBounceCooldown = 0;
    chargeBounceCooldownDuration = 400;
    knocksBack = true;
    knockbackDistance = 50;

    minX;
    maxX;
    movingLeft = true;

    offset = {
        top : 5,
        left : 5,
        right : 12,
        bottom : 30
    };
    
    /**
     * The 3 available color variants, matching the "1./2./3." prefixed
     * folders/files under assets/img/2.Enemy/1.Puffer_fish_3_color_options.
     */
    static COLOR_VARIANTS = ['1', '2', '3'];

    PUFFERFISH_IMAGES_SWIM;
    PUFFERFISH_IMAGES_TRANSITION;
    PUFFERFISH_IMAGES_BUBBLESWIM;
    PUFFERFISH_IMAGES_DIE;

    /**
     * Builds the swim/transition/bubbleswim/die image paths for a given
     * color variant. Variant 3's die frames are named inconsistently in
     * the asset folder (3.png / 3.2.png / 3.3.png instead of a clean
     * 1/2/3 sequence) - they're reordered here to match the same
     * puffed-up -> deflating -> flat sequence the other variants use.
     * @param {string} variant - Color variant, one of Pufferfish.COLOR_VARIANTS.
     * @returns {{swim: Array<string>, transition: Array<string>, bubbleswim: Array<string>, die: Array<string>}} Image path sets for this variant.
     */
    static buildImageSet(variant) {
        let base = './assets/img/2.Enemy/1.Puffer_fish_3_color_options';
        let die = variant === '3'
            ? [`${base}/4.DIE/3.png`, `${base}/4.DIE/3.3.png`, `${base}/4.DIE/3.2.png`]
            : variant === '2'
                ? [`${base}/4.DIE/2.1.png`, `${base}/4.DIE/2.2.png`, `${base}/4.DIE/2.3.png`]
                : [`${base}/4.DIE/1.Dead.1.png`, `${base}/4.DIE/1.Dead.2.png`, `${base}/4.DIE/1.Dead.3.png`];
        return {
            swim: [1, 2, 3, 4, 5].map(n => `${base}/1.Swim/${variant}.swim${n}.png`),
            transition: [1, 2, 3, 4].map(n => `${base}/2.transition/${variant}.transition${n}.png`),
            bubbleswim: [1, 2, 3, 4, 5].map(n => `${base}/3.Bubbleeswim/${variant}.bubbleswim${n}.png`),
            die,
        };
    }

    /**
     * Creates a new Pufferfish instance.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} [strengthBonus=0] - Extra strength/health added on top of the base value.
     * @param {string} [colorVariant='1'] - Which of the 3 color variants to use, e.g. picked per level.
     */
    constructor(x, y, strengthBonus = 0, colorVariant = '1'){
        super();
        let images = Pufferfish.buildImageSet(colorVariant);
        this.PUFFERFISH_IMAGES_SWIM = images.swim;
        this.PUFFERFISH_IMAGES_TRANSITION = images.transition;
        this.PUFFERFISH_IMAGES_BUBBLESWIM = images.bubbleswim;
        this.PUFFERFISH_IMAGES_DIE = images.die;
        this.loadImage(images.swim[0]);
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_TRANSITION);
        this.loadImages(this.PUFFERFISH_IMAGES_BUBBLESWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_DIE);
        this.speed = 0.15 + Math.random() * 0.5;
        this.x = x;
        this.y = y;
        this.minX = this.x - (200 + Math.random() * 200);
        this.maxX = this.x + (200 + Math.random() * 200);
        this.strengthBonus = strengthBonus;
        this.health += strengthBonus;
        this.getRealFrame();
    }

    /**
     * Updates the object#s state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Character} character - The player character.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     * @returns 
     */
    update(deltaTime, character, level) {

        if (this.isDying) {
            this.updateDying(deltaTime, this.PUFFERFISH_IMAGES_DIE);
            return;
        }
        let distance = this.edgeDistanceTo(character);
        this.updateAlertState(distance, character, level);

        if (this.alertState === 'entering') { this.updateEntering(deltaTime); return; }
        if (this.alertState === 'charging') { this.updateCharging(deltaTime, character, level); return; }
        if (this.alertState === 'exiting') { this.updateExiting(deltaTime); return; }

        this.updatePatrol(deltaTime, level);
    }

    /**
     * Updates alert state.
     * @param {number} distance - Distance in pixels.
     * @param {Character} character - The player character.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    updateAlertState(distance, character, level){
        if (this.alertState === 'idle' && distance <= this.detectionRange && character) {
            if (this.isCharacterInFront(character) && this.hasLineOfSightTo(character, level)) {
                this.alertState = 'entering';
                this.transitionFrame = 0;
                this.transitionTimer = 0;
            }
        }
        if ((this.alertState === 'entering' || this.alertState === 'charging') && distance > this.exitRange) {
            this.alertState = 'exiting';
        }
        this.damage = (this.alertState === 'idle' ? 2 : 4) + this.strengthBonus;
    }

    /**
     * Checks whether character in front
     * @param {Character} character - The player character.
     * @returns {boolean} True if the condition holds, false otherwise.
     */
    isCharacterInFront(character){
        let facingLeft = !this.otherDirection;
        let charCenterX = character.x + character.width / 2;
        let myCenterX = this.x + this.width / 2;
        return facingLeft ? charCenterX <= myCenterX : charCenterX >= myCenterX;
    }

    /**
     * Updates entering.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateEntering(deltaTime){
        this.transitionTimer += deltaTime;
        if (this.transitionTimer > this.transitionFrameDuration) {
            this.transitionTimer = 0;
            this.transitionFrame++;
            if (this.transitionFrame >= this.PUFFERFISH_IMAGES_TRANSITION.length) {
                this.alertState = 'charging';
                this.transitionFrame = 0;
            }
        }
        if (this.alertState === 'entering') {
            this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
        }
    }

    /**
     * Updates exiting.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateExiting(deltaTime){
        this.transitionTimer += deltaTime;
        if (this.transitionTimer > this.transitionFrameDuration) {
            this.transitionTimer = 0;
            this.transitionFrame--;
            if (this.transitionFrame < 0) {
                this.alertState = 'idle';
                this.transitionFrame = 0;
                this.otherDirection = !this.movingLeft;
            }
        }
        if (this.alertState === 'exiting') {
            this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
        }
    }

    /**
     * Updates charging.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Character} character - The player character.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    updateCharging(deltaTime, character, level){
        this.updateChargeDirection(deltaTime, character);
        if (this.chargeDirectionLeft) this.moveLeft(deltaTime); else this.moveRight(deltaTime);
        this.checkChargeBounce(level);
        this.getRealFrame();
        this.otherDirection = !this.chargeDirectionLeft;
        this.animateImages(this.PUFFERFISH_IMAGES_BUBBLESWIM, deltaTime, 150);
    }

    /**
     * Updates charge direction.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Character} character - The player character.
     */
    updateChargeDirection(deltaTime, character){
        if (this.chargeBounceCooldown > 0) {
            this.chargeBounceCooldown -= deltaTime;
            return;
        }
        if (!character) return;
        let dx = (character.x + character.width / 2) - (this.x + this.width / 2);
        if (Math.abs(dx) > this.chargeDeadzone) {
            this.chargeDirectionLeft = dx < 0;
        }
    }

    /**
     * Checks charge bounce.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    checkChargeBounce(level){
        let hitLeft = this.isAtLeftLevelBound(level);
        let hitRight = this.isAtRightLevelBound(level);
        let hitCoin = this.isBlockedByObstacle(level);

        if (hitLeft || (hitCoin && this.chargeDirectionLeft)) {
            if (level && this.x < level.level_start_x) this.x = level.level_start_x;
            this.chargeDirectionLeft = false;
            this.chargeBounceCooldown = this.chargeBounceCooldownDuration;
        } else if (hitRight || (hitCoin && !this.chargeDirectionLeft)) {
            if (level) this.x = level.level_end_x - this.width;
            this.chargeDirectionLeft = true;
            this.chargeBounceCooldown = this.chargeBounceCooldownDuration;
        }
    }

    /**
     * Updates patrol.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    updatePatrol(deltaTime, level){
        if (this.movingLeft) {
            this.moveLeft(deltaTime);
            this.checkPatrolBoundLeft(level);
        } else {
            this.moveRight(deltaTime);
            this.checkPatrolBoundRight(level);
        }
        this.animateImages(this.PUFFERFISH_IMAGES_SWIM, deltaTime, 150);
    }

    /**
     * Checks patrol bound left.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    checkPatrolBoundLeft(level){
        let hitCoin = this.isBlockedByObstacle(level);
        if (this.x <= this.minX || this.isAtLeftLevelBound(level) || hitCoin) {
            if (level && this.x < level.level_start_x) this.x = level.level_start_x;
            this.movingLeft = false;
            this.otherDirection = true;
            this.getRealFrame();
        }
    }

    /**
     * Checks patrol bound right.
     * @param {Level} level - The current level, containing enemies, coins and bounds.
     */
    checkPatrolBoundRight(level){
        let hitCoin = this.isBlockedByObstacle(level);
        if (this.x >= this.maxX || this.isAtRightLevelBound(level) || hitCoin) {
            if (level && this.x + this.width > level.level_end_x) this.x = level.level_end_x - this.width;
            this.movingLeft = true;
            this.otherDirection = false;
            this.getRealFrame();
        }
    }
}