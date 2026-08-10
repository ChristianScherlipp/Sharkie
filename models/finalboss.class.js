import { MovableObject } from "./movable-object.class.js";
import { AudioHub } from "./audio-hub.class.js";

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

    health = 50;
    maxHealth = 50;
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


    constructor (x, y){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.loadImages(this.FINALBOSS_IMAGES_SWIM);
        this.loadImages(this.FINALBOSS_IMAGES_ATTACK);
        this.loadImages(this.FINALBOSS_IMAGES_HURT);
        this.loadImages(this.FINALBOSS_IMAGES_DEATH);
        this.loadImages(this.FINALBOSS_IMAGES_INTRODUCE);
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

    startIntroducing() {
        this.hasAppeared = true;
        this.isIntroducing = true;
        this.introFrame = 0;
        this.introTimer = 0;
        this.img = this.imageCache[this.FINALBOSS_IMAGES_INTRODUCE[0]];
        AudioHub.playOne(AudioHub.BOSS_APPEARS);
    }
    // Wird jeden Frame von World.update() aufgerufen.
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
 
    // Spielt die Auftritts-Animation ab. Gibt true zurück, solange sie noch
    // läuft (der Aufrufer bricht dann für diesen Frame ab).
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

    // Fügt alle poisonTickInterval-ms Gift-Schaden zu, solange isPoisoned aktiv ist.
    updatePoisonTick(deltaTime){
        if (!this.isPoisoned) return;
        this.poisonTickTimer += deltaTime;
        if (this.poisonTickTimer > this.poisonTickInterval) {
            this.poisonTickTimer = 0;
            this.takeDamage(this.poisonTickDamage);
            this.justPoisonTicked = true;
        }
    }

    // Zählt die Hurt-Animation durch und beendet sie nach dem letzten Bild.
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

    // Zustandsmaschine wander -> following -> attacking, abhängig von
    // Sichtkontakt und Abstand zu Sharkie.
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

    startAttacking(){
        this.state = 'attacking';
        AudioHub.playOne(AudioHub.BOSS_ATTACK);
    }

     // Legt die Bewegungsrichtung (vx/vy) fest: im "wander"-Zustand per Timer
    // zufällig, sonst direkt auf Sharkie zu.
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

    getSpeedMultiplier(){
        if (this.state === 'following') return this.folloSpeedMultiplier;
        if (this.state === 'attacking') return this.attackSpeedMultuplier;
        return 1;
    }

    // Bewegt den Boss gemäß vx/vy, hält ihn innerhalb seines Bereichs und
    // aktualisiert die Blickrichtung.
    applyMovement(deltaTime){
        let factor = deltaTime / (1000 / 120);
        let speedMultiplier = this.getSpeedMultiplier();
        this.x += this.vx * this.speed * speedMultiplier * factor;
        this.y += this.vy * this.speed * speedMultiplier * factor;
        this.clampToBounds();
        if (this.vx < 0) this.otherDirection = false;
        else if (this.vx > 0) this.otherDirection = true;
    }

    clampToBounds(){
        if (this.x <= this.minX) { this.x = this.minX; this.vx = 1; }
        if (this.x >= this.maxX) { this.x = this.maxX; this.vx = -1; }
        if (this.y <= this.minY) { this.y = this.minY; this.vy = 1; }
        if (this.y >= this.maxY) { this.y = this.maxY; this.vy = -1; }
    }

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

    isCharacterInSight(character){
        let facingLeft = !this.otherDirection;
        let inFront = facingLeft 
            ? (character.x + character.width / 2) <= (this.x + this.width / 2)
            : (character.x + character.width / 2) >= (this.x + this.width / 2);

        let verticalDiff = Math.abs((character.y + character.height / 2) - ( this.y + this.height / 2));
        return inFront && verticalDiff <= this.verticalSightTolerance;
    }

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

    registerPoisonHit() {
        if (this.isPoisoned) return;
        this.poisonHitCount++;
        if (this.poisonHitCount >= 3) {
            this.isPoisoned = true;
            this.poisonTickTimer = 0;
        }
    }

}