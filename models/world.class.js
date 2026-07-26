import { Character } from "./character.class.js";
import { Coinbar } from "./coinbar.class.js";
import { Healthbar } from "./healthbar.class.js";
import { Posionbar } from "./posionbar-object.class.js";
import { FiringObject } from "./firing-object.class.js";
import { level1 } from "../levels/level1.js"
import { Light } from "./light.class.js";
 
export class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    coinBar = new Coinbar();
    healthBar = new Healthbar();
    posionBar = new Posionbar();
    firingObjects = [];
    lastTime = 0;
    collisionTimer = 0;
    totalCoins = this.level.coins.reduce((sum, coin) => sum + coin.value, 0);
    collectedCoins = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setWorld();
        this.lastTime = performance.now();
        this.run();
    }

    // Zentraler Game-Loop läuft über requestAnimationFrame,
    // ersetzt alle vorherigen setIntervals im Projekt
    run(time = performance.now()){
        let deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame((t) => this.run(t))
    }

    update(deltaTime){
        this.character.update(deltaTime);
        this.level.enemies.forEach(enemy => enemy.update(deltaTime));
        this.level.coins.forEach(coin => coin.update(deltaTime));
        this.level.lights.forEach(light => light.update(deltaTime));
        this.firingObjects.forEach(fo => fo.update(deltaTime));
        //Kollision & Schießen liefen früher alle 200ms per eigenen Interval,
        // das wird hier über einen zähler nachgebildet.
        this.collisionTimer += deltaTime;
        if (this.collisionTimer > 200) {
            this.checkCollision();
            this.checkFiringObjects();
            this.collisionTimer = 0;
            if (this.character.justAttacked) {
                this.checkCoinHit();
                this.character.justAttacked = false;
            }
        }
    }

    draw(){
        // Canvas Clearen um neu geladenen bilder anzuzeigen 
        // und das vorgänger bild aus dem canvas entfernt wird.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects); // Background laden
        this.addObjectsToMap(this.level.lights); // Licht Laden
        this.addObjectsToMap(this.level.enemies); // Gegner aus dem Array enemies laden
        this.addObjectsToMap(this.level.coins);
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.character); // Character laden
        this.ctx.translate(-this.camera_x, 0);
    }

    addObjectsToMap (objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap (mo){
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
        mo.drawFrame(this.ctx);
    }
        
    // Image Spiegeln
    flipImage (mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1)
        mo.x = mo.x * -1;
    }
    // gespiegeltest Image zurücksetzen
    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    setWorld(){
        this.character.world = this;
    }


    checkFiringObjects(){
        if (this.keyboard.SPACE) {
            let bubble = new FiringObject(this.character.x + 200, this.character.y + 150);        
            this.firingObjects.push(bubble)
        }
    }

    checkCollision(){
        this.level.enemies.forEach((enemy) =>{
                if(this.character.isColliding(enemy)) {
                    this.character.hit();
                    this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR)
                    
                }
            })
    }

    // Rückwärts itterieren, damit das Entfernen (splice) während des  Durchlaufs
    // keine Coins überspringt
    checkCoinHit(){
        for (let i = this.level.coins.length - 1; i >= 0; i--){
            let coin = this.level.coins[i];
            if (this.character.isColliding(coin)) {
                coin.value--;
                this.collectedCoins++;
                let percentage = (this.collectedCoins / this.totalCoins) * 100;
                this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
                if (coin.value <= 0) {
                    this.level.coins.splice(i, 1);
                }
            }
        }
    }
}