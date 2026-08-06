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

    // Zähler für Sprite-Animationen, wird von animateImages() genutzt
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

    // Referenz-Tick war früher 1000/120 ms -> alle Werte bleiben wie voher kalibriert,
    // "factor" gleicht unterschiedliche Bildwiederholraten aus 
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

    //Ersetzt die früheren einzelnen setINterval-Animationsschleifen.
    // interval = wie viele ms zwischen zwei Bildwechseln liegen soll (z.B. 150)
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

    // Prüft, ob dieses Objekt gerade ein Objekt berührt, das die Bewegung
    // blockiert (z.B. BigCoin, blocksMovement = true). Wird von Gegnern
    // genutzt, damit sie nicht durch BigCoins hindurchschwimmen.
    isBlockedByObstacle(level){
        return !!(level && level.coins && level.coins.some(obj => obj.blocksMovement && this.isColliding(obj)));
    }

    // Level-Rand links/rechts erreicht (statt Canvas, da das Level scrollt).
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

    hit(damage = 2){
        this.energy -= damage;
        if(this.energy < 0){
            this.energy = 0;
        }else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit; //Difference in ms
        timepassed = timepassed / 1000; // Difference in s
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

    //  Wird von der zentralen Game-Loop in World jeden Frame aufgerufen.
    // Unterklassen überschreiben das mit ihrer eigenen Bewegungs- / Animationslogik
    update(deltaTime){
        // absichtlich leer(default no+op)
    }
}