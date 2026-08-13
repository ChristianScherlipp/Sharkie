import { Character } from "./character.class.js";
import { Coinbar } from "./coinbar.class.js";
import { Healthbar } from "./healthbar.class.js";
import { Posionbar } from "./posionbar-object.class.js";
import { Finalboss } from "./finalboss.class.js";
import { AudioHub } from "./audio-hub.class.js";
import { createLevl1 } from "../levels/level1.js"
import { createLevl2 } from "../levels/level2.js";
import { WorldRenderMixin } from "./world-render.mixin.js";
import { WorldCombatMixin } from "./world-combat.mixin.js";
import { WorldItemsMixin } from "./world-items.mixin.js";
import { WorldBossIntroMixin } from "./world-boss-intro.mixin.js";

export class World {
    character = new Character();
    level;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    callbacks = {};
    gameEnded = false;
    gameWinning = false;

    paused = false;

    isLastLevel = true;
    coinBar = new Coinbar();
    healthBar = new Healthbar();
    posionBar = new Posionbar();
    firingObjects = [];
    lastTime = 0;
    collisionTimer = 0;

    totalCoins = 0;
    collectedCoins = 0;

    totalPoisons = 0;
    collectedPoisons = 0;

    experience = 0;

    xpPopups = [];

    netTriggered = false;

    finalboss;
    showFinalbossHealthbar = false;

    damagePopups = [];

    coinPopups = [];

    bossIntroPhase = 'pending';
    cameraPanStartX = 0;
    cameraPanTargetX = 0;
    cameraPanElapsed = 0;
    cameraPanDuration = 1500;

    /**
     * Creates a new instance.
     * @param {HTMLCanvasElement} canvas - The canvas element the game is rendered on.
     * @param {Keyboard} keyboard - The keyboard state object.
     * @param {Object} [callbacks={}] - Callback functions the World triggers on game events.
     * @param {number} [levelNumber=1] - Number of the level to load (1-based).
     */
    constructor(canvas, keyboard, callbacks = {}, levelNumber = 1) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.callbacks = callbacks;
        this.loadLevel(levelNumber);
        this.setWorld();
        this.lastTime = performance.now();
        this.run();
    }

    /**
     * Loads level.
     * @param {number} levelNumber - Number of the level to load (1-based).
     */
    loadLevel(levelNumber){
        this.level = levelNumber === 2 ? createLevl2() : createLevl1();
        this.totalCoins = this.level.coins.reduce((sum, coin) => sum + coin.value, 0);
        this.totalPoisons = this.level.poisons.reduce((sum, poison) => sum + poison.value, 0);
        this.finalboss = this.level.enemies.find(e => e instanceof Finalboss);
        this.isLastLevel = levelNumber >= 2;
    }

    /**
     * Main game loop, driven by requestAnimationFrame. Computes the delta
     * time since the last frame, updates and redraws the world, and keeps
     * scheduling itself unless the game has ended or is paused.
     * @param {number} [time=performance.now()] - Current timestamp in milliseconds, provided by requestAnimationFrame.
     */
    run(time = performance.now()){
        if (this.paused) {
            this.lastTime = time;
            requestAnimationFrame((t) => this.run(t));
            return;
        }
        let deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.update(deltaTime);
        this.draw();
        if (!this.gameEnded) {
            requestAnimationFrame((t) => this.run(t));
        }
    }

    /**
     * Pause.
     */
    pause(){
        this.paused = true;
    }

    /**
     * Resume.
     */
    resume(){
        this.paused = false;
    }

    /**
     * Updates the object's state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime){
        if (this.gameEnded) return;
        this.updateEntities(deltaTime);
        this.updateFiringObjects(deltaTime);
        this.checkNetTrigger();
        this.updateBossIntro(deltaTime);
        this.updateCollisionTimer(deltaTime);
        this.updateCollectionAndAttacks();
        this.updateBossState();
        this.cleanupEntities(deltaTime);
        this.checkGameOver();
        this.checkGameWin();
        this.checkLevelTransition();
    }

    /**
     * Updates entities.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateEntities(deltaTime){
        this.character.update(deltaTime);
        this.level.enemies.forEach(enemy => enemy.update(deltaTime, this.character, this.level));
        this.level.coins.forEach(coin => coin.update(deltaTime));
        this.level.poisons.forEach(poison => poison.update(deltaTime));
        this.level.lights.forEach(light => light.update(deltaTime));
        this.level.net.update(deltaTime);
    }

    /**
     * Updates firing objects.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateFiringObjects(deltaTime){
        this.firingObjects.forEach(fo => fo.update(deltaTime));
        this.removeExpiredBubbles();
    }

    /**
     * Removes expired bubbles.
     */
    removeExpiredBubbles(){
        let expired = this.firingObjects.filter(fo => fo.age >= 5000);
        expired.forEach(() => AudioHub.playOne(AudioHub.BUBBLE_BURST));
        this.firingObjects = this.firingObjects.filter(fo => fo.age < 5000);
    }

    /**
     * Updates collision timer.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateCollisionTimer(deltaTime){
        this.collisionTimer += deltaTime;
        if (this.collisionTimer > 200) {
            this.checkCollision();
            this.collisionTimer = 0;
        }
    }

    /**
     * Updates collection and attacks.
     */
    updateCollectionAndAttacks(){
        this.checkCoinCollision();
        this.checkPoisonCollision();
        this.checkAttackHits();
        this.checkFiringObjects();
        this.checkPoisonFiringObjects();
        this.checkBubbleHitOnEnemies();
        this.checkPoisonBubbleHitOnEnemies();
    }

    /**
     * Checks attack hits.
     */
    checkAttackHits(){
        if (!this.character.justAttacked) return;
        let hitCoin = this.checkCoinHit();
        let hitEnemy = this.checkFinSlapOnEnemies();
        this.character.lastAttackHit = hitCoin || hitEnemy;
        this.character.justAttacked = false;
    }

    /**
     * Updates boss state.
     */
    updateBossState(){
        this.showFinalbossHealthbar = !!(this.finalboss && this.finalboss.introduced);
        if (!this.finalboss) return;
        if (this.finalboss.isDying && !this.finalboss.xpAwarded) {
            this.finalboss.xpAwarded = true;
            this.awardExperience(5000, this.finalboss);
        }
        if (this.finalboss.justPoisonTicked) {
            this.finalboss.justPoisonTicked = false;
            this.showDamagePopup(this.finalboss.poisonTickDamage, this.finalboss);
        }
    }

    /**
     * Cleans up entities.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    cleanupEntities(deltaTime){
        this.level.enemies = this.level.enemies.filter(enemy => !enemy.markedForRemoval);
        this.xpPopups = this.ageAndFilterPopups(this.xpPopups, deltaTime);
        this.damagePopups = this.ageAndFilterPopups(this.damagePopups, deltaTime);
        this.coinPopups = this.ageAndFilterPopups(this.coinPopups, deltaTime);
    }

    /**
     * Advances each popup's elapsed time and drops the ones that have
     * outlived their display duration (used for XP/damage/coin popups).
     * @param {Array<Object>} popups - List of popup objects to update/draw.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     * @returns {Array<Object>} The popups that are still within their display duration.
     */
    ageAndFilterPopups(popups, deltaTime){
        popups.forEach(popup => popup.elapsed += deltaTime);
        return popups.filter(popup => popup.elapsed < popup.duration);
    }

    /**
     * Checks game over.
     */
    checkGameOver() {
        if (this.gameEnded || this.gameWinning) return;
        if (this.character.markedForRemoval) {
            this.gameEnded = true;
            if (this.callbacks.onGameOver) this.callbacks.onGameOver();
        }
    }

    /**
     * Checks game win.
     */
    checkGameWin() {
        if (this.gameEnded || this.gameWinning) return;
        if (this.finalboss && this.finalboss.markedForRemoval) {
            this.gameWinning = true;
            if (this.isLastLevel) {
                this.gameEnded = true;
                if (this.callbacks.onWinFinal) this.callbacks.onWinFinal();
            } else {
                this.character.autoSwimRight = true;
                if (this.callbacks.onWinBanner) this.callbacks.onWinBanner();
            }
        }
    }

    /**
     * Checks level transition.
     */
    checkLevelTransition(){
        if (!this.gameWinning || this.isLastLevel || this.gameEnded) return;
        let viewportRight = -this.camera_x + this.canvas.width;
        if (this.character.x > viewportRight) {
            this.gameEnded = true;
            if (this.callbacks.onLevelComplete) this.callbacks.onLevelComplete();
        }
    }

    /**
     * Sets world.
     */
    setWorld(){
        this.character.world = this;
    }
}

Object.assign(World.prototype, WorldRenderMixin, WorldCombatMixin, WorldItemsMixin, WorldBossIntroMixin);