import { MovableObject } from "../core/movable-object.class.js";
import { AudioHub } from "../audio/audio-hub.class.js";

export class Finalboss extends MovableObject {
    showFrame = false;
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

    health = 30;
    maxHealth = 30;
    xpAwarded = false;

    isHurt = false;
    hurtFrame = 0;
    hurtTimer = 0;
    hurtFrameDuration = 120;
    damage = 3;

    poisonHitCount = 0;
    isPoisoned = false;
    poisonTickTimer = 0;
    poisonTickInterval = 1500;
    poisonTickDamage = 2;
    justPoisonTicked = false;

    hasAppeared = false;
    introduced = false;
    isIntroducing = false;
    introFrame = 0;
    introTimer = 0;
    introFrameDuration = 100;

    offset = {
        top : 80,
        left : 15,
        right : 20,
        bottom : 40
    };

    FINALBOSS_IMAGES_INTRODUCE = [
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/1.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/2.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/3.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/4.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/5.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/6.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/7.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/8.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/9.png',
        './assets/img/2.Enemy/3.Final_Enemy/1.Introduce/10.png',
    ];

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

    FINALBOSS_IMAGES_HURT = [
        './assets/img/2.Enemy/3.Final_Enemy/Hurt/1.png',
        './assets/img/2.Enemy/3.Final_Enemy/Hurt/2.png',
        './assets/img/2.Enemy/3.Final_Enemy/Hurt/3.png',
        './assets/img/2.Enemy/3.Final_Enemy/Hurt/4.png',
    ];

    FINALBOSS_IMAGES_DEATH = [
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death1.png',
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death6.png',
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death7.png',
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death8.png',
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death9.png',
        './assets/img/2.Enemy/3.Final_Enemy/Dead/2death10.png',
    ];

    /**
     * Creates a new Finalboss instance.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} [strengthBonus=0] - Extra strength/health added on top of the base value.
     */
    constructor (x, y, strengthBonus = 0){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.loadImages(this.FINALBOSS_IMAGES_SWIM);
        this.loadImages(this.FINALBOSS_IMAGES_ATTACK);
        this.loadImages(this.FINALBOSS_IMAGES_HURT);
        this.loadImages(this.FINALBOSS_IMAGES_DEATH);
        this.loadImages(this.FINALBOSS_IMAGES_INTRODUCE);
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.health += strengthBonus;
        this.maxHealth += strengthBonus;
        this.damage += strengthBonus;
        this.pickRandomDirection();
        this.getRealFrame();
    }

    /**
     * Picks random direction.
     */
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

    /**
     * Starts introducing.
     */
    startIntroducing() {
        this.hasAppeared = true;
        this.isIntroducing = true;
        this.introFrame = 0;
        this.introTimer = 0;
        this.img = this.imageCache[this.FINALBOSS_IMAGES_INTRODUCE[0]];
        AudioHub.playOne(AudioHub.BOSS_APPEARS);
    }
    
    /**
     * Updates the object's state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Character} character - The player character.
     */
    update(deltaTime, character){
        if (this.updateIntro(deltaTime)) return;
        if (!this.introduced) return;
        if (this.isDying) { this.updateDying(deltaTime, this.FINALBOSS_IMAGES_DEATH); return; } 
        this.updatePoisonTick(deltaTime);
        if (this.isDying) { this.updateDying(deltaTime, this.FINALBOSS_IMAGES_DEATH); return; }

        this.updateHurtTimer(deltaTime);
        this.updateState(character);
        this.updateDirection(deltaTime, character);
        this.applyMovement(deltaTime);
        this.updateBossAnimation(deltaTime);
    }

    /**
     * Updates intro.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {*} The computed result.
     */
    updateIntro(deltaTime){
        if (!this.isIntroducing) return false;
        this.introTimer += deltaTime;
        if (this.introTimer > this.introFrameDuration) {
            this.introTimer = 0;
            this.introFrame++;
            if (this.introFrame >= this.FINALBOSS_IMAGES_INTRODUCE.length) {
                this.isIntroducing = false;
                this.introduced = true;
            } else {
                this.img = this.imageCache[this.FINALBOSS_IMAGES_INTRODUCE[this.introFrame]];
            }
        }
        return true;
    }

    /**
     * Updates poison tick.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updatePoisonTick(deltaTime){
        if (!this.isPoisoned) return;
        this.poisonTickTimer += deltaTime;
        if (this.poisonTickTimer > this.poisonTickInterval) {
            this.poisonTickTimer = 0;
            this.takeDamage(this.poisonTickDamage);
            this.justPoisonTicked = true;
        }
    }

    /**
     * Updates hurt timer.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateHurtTimer(deltaTime){
        if (!this.isHurt) return;
        this.hurtTimer += deltaTime;
        if (this.hurtTimer > this.hurtFrameDuration) {
            this.hurtTimer = 0;
            this.hurtFrame++;
            if (this.hurtFrame >= this.FINALBOSS_IMAGES_HURT.length) {
                this.isHurt = false;
            }
        }
    }

    /**
     * Updates state.
     * @param {Character} character - The player character.
     */
    updateState(character){
        if (!character) { this.state = 'wander'; return; }
        let inSight = this.isCharacterInSight(character);
        let distance = this.edgeDistanceTo(character);

        if (this.state !== 'attacking' && inSight && distance <= this.attackRange) {
            this.startAttacking();
        } else if (this.state === 'attacking' && (!inSight || distance > this.attackExitRange)) {
            this.state = inSight && distance <= this.followExitRange ? 'following' : 'wander';
        } else if (this.state === 'wander' && inSight && distance <= this.followRange) {
            this.state = 'following';
        } else if (this.state === 'following' && (!inSight || distance >= this.followExitRange)) {
            this.state = 'wander';
        }
    }

    /**
     * Starts attacking.
     */
    startAttacking(){
        this.state = 'attacking';
        AudioHub.playOne(AudioHub.BOSS_ATTACK);
    }

    /**
     * Updates direction.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @param {Character} character - The player character.
     */
    updateDirection(deltaTime, character){
        if (this.state === 'wander') {
            this.directionChangeTimer += deltaTime;
            if (this.directionChangeTimer > this.directionChangeInterval) {
                this.pickRandomDirection();
            }
            return;
        }
        let dx = (character.x + character.width / 2) - (this.x + this.width / 2);
        let dy = (character.y + character.height / 2) - (this.y + this.height / 2);
        let len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = dx / len;
        this.vy = dy / len;
    }

    /**
     * Gets speed multiplier.
     * @returns {*} The requested value.
     */
    getSpeedMultiplier(){
        if (this.state === 'following') return this.folloSpeedMultiplier;
        if (this.state === 'attacking') return this.attackSpeedMultuplier;
        return 1;
    }

    /**
     * Applies movement.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    applyMovement(deltaTime){
        let factor = deltaTime / (1000 / 120);
        let speedMultiplier = this.getSpeedMultiplier();
        this.x += this.vx * this.speed * speedMultiplier * factor;
        this.y += this.vy * this.speed * speedMultiplier * factor;
        this.clampToBounds();
        if (this.vx < 0) this.otherDirection = false;
        else if (this.vx > 0) this.otherDirection = true;
    }

    /**
     * Clamps to bounds.
     */
    clampToBounds(){
        if (this.x <= this.minX) { this.x = this.minX; this.vx = 1; }
        if (this.x >= this.maxX) { this.x = this.maxX; this.vx = -1; }
        if (this.y <= this.minY) { this.y = this.minY; this.vy = 1; }
        if (this.y >= this.maxY) { this.y = this.maxY; this.vy = -1; }
    }

    /**
     * Updates boss animation.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateBossAnimation(deltaTime){
        this.getRealFrame();
        if (this.isHurt) {
            this.img = this.imageCache[this.FINALBOSS_IMAGES_HURT[this.hurtFrame]];
        } else if (this.state === 'attacking') {
            this.animateImages(this.FINALBOSS_IMAGES_ATTACK, deltaTime, 100);
        } else {
            this.animateImages(this.FINALBOSS_IMAGES_SWIM, deltaTime, 150);
        }
    }

    /**
     * Checks whether character in sight.
     * @param {Character} character - The player character.
     * @returns {boolean} True if the condition holds, false otherwise.
     */
    isCharacterInSight(character){
        let facingLeft = !this.otherDirection;
        let inFront = facingLeft 
            ? (character.x + character.width / 2) <= (this.x + this.width / 2)
            : (character.x + character.width / 2) >= (this.x + this.width / 2);

        let verticalDiff = Math.abs((character.y + character.height / 2) - ( this.y + this.height / 2));
        return inFront && verticalDiff <= this.verticalSightTolerance;
    }

    /**
     * Take damage.
     * @param {number} amount - The amount to apply.
     */
    takeDamage (amount) {
        if (this.isDying) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.startDying();
            return;
        }
        this.isHurt = true;
        this.hurtFrame = 0;
        this.hurtTimer = 0;
    }

    /**
     * Registers poison hit.
     */
    registerPoisonHit() {
        if (this.isPoisoned) return;
        this.poisonHitCount++;
        if (this.poisonHitCount >= 3) {
            this.isPoisoned = true;
            this.poisonTickTimer = 0;
        }
    }

}