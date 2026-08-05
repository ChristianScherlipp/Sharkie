import { Character } from "./character.class.js";
import { Coinbar } from "./coinbar.class.js";
import { Healthbar } from "./healthbar.class.js";
import { Posionbar } from "./posionbar-object.class.js";
import { FiringObject } from "./firing-object.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
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
    totalPoisons = this.level.poisons.reduce((sum, poison) => sum + poison.value, 0);
    collectedPoisons = 0;
    xpPopups = [];
    experience = 0;

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
        this.level.enemies.forEach(enemy => enemy.update(deltaTime, this.character));
        this.level.coins.forEach(coin => coin.update(deltaTime));
        this.level.poisons.forEach(poison => poison.update(deltaTime));
        this.level.lights.forEach(light => light.update(deltaTime));
        this.level.net.update(deltaTime);
        this.firingObjects.forEach(fo => fo.update(deltaTime));
        this.xpPopups.forEach(popup => popup.elapsed += deltaTime);
        this.xpPopups = this.xpPopups.filter(popup => popup.elapsed < popup.duration);
        //Kollision & Schießen liefen früher alle 200ms per eigenen Interval,
        // das wird hier über einen zähler nachgebildet.
        this.collisionTimer += deltaTime;
        if (this.collisionTimer > 200) {
            this.checkCollision();
            this.collisionTimer = 0;
        }
        
        this.checkNetTrigger();
        this.checkFiringObjects();
        this.checkPoisonFiringObjects();
        
        this.checkCoinCollision();
        this.checkPoisonCollision();
        
        if (this.character.justAttacked) {
            let hitCoin = this.checkCoinHit();
            let hitEnemy = this.checkFinSlapOnEnemies();
            this.character.lastAttackHit = hitCoin || hitEnemy;
            this.character.justAttacked = false;
        }

        this.checkBubbleHitOnEnemies();
        this.level.enemies = this.level.enemies.filter(enemy => !enemy.markedForRemoval);
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
        this.addObjectsToMap(this.level.poisons);
        this.drawXpPopups();
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.drawExperience();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.level.net);
        this.addToMap(this.character); // Character laden
        this.drawConfusion();
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

    drawExperience(){
        let text = String(this.experience).padStart(6, '0');
        let x = this.canvas.width / 2;
        let y = 30;
        this.ctx.save();
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeText(text, x, y);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    awardExperience(amount, enemy) {
        this.experience += amount;
        this.xpPopups.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y,
            text: `+${amount}`,
            elapsed: 0,
            duration: 800,
            riseDistance: 75
        });
    }

    drawXpPopups(){
        this.xpPopups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            let alpha = 1 - t;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.font = 'bold 15px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeText(popup.text, popup.x, y);
            this.ctx.fillStyle = 'yellow';
            this.ctx.fillText(popup.text, popup.x, y);
            this.ctx.restore();
        })
    }

    checkFiringObjects(){
        if (this.character.justFiredBubble) {
            this.character.justFiredBubble = false;
            let direction = this.character.otherDirection ? -1 : 1;
            let spawnX = this.character.otherDirection 
                ? this.character.x - 20 
                : this.character.x + this.character.width - 50;
            let bubble = new FiringObject(spawnX, this.character.y + 150, direction);
            this.firingObjects.push(bubble);
        }
    }

    checkPoisonFiringObjects(){
        if (this.character.justFiredPoison) {
            this.character.justFiredPoison = false;
            this.collectedPoisons--;
            let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
            this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
            let direction = this.character.otherDirection ? -1 : 1;
            let spawnX = this.character.otherDirection
                ? this.character.x - 20
                : this.character.x + this.character.width - 60;
            let poisonShot = new PoisonBubble(spawnX, this.character.y + 150, direction);
            this.firingObjects.push(poisonShot);
        }
    }

    applyKnockback(enemy){
        let charLeft = this.character.rX;
        let charRight = this.character.rX + this.character.rW;
        let charTop = this.character.rY;
        let charBottom = this.character.rY + this.character.rH;
        let enemyLeft = enemy.rX;
        let enemyRight = enemy.rX + enemy.rW;
        let enemyTop = enemy.rY;
        let enemyBottom = enemy.rY + enemy.rH;
        let overlapX = Math.min(charRight, enemyRight) - Math.max(charLeft, enemyLeft);
        let overlapY = Math.min(charBottom, enemyBottom) - Math.max(charTop, enemyTop);
        let distance = enemy.knockbackDistance ?? 100;
        let targetX = this.character.x;
        let targetY = this.character.y;
        if (overlapX < overlapY) {
            targetX += (this.character.x < enemy.x) ? -distance : distance;
        } else {
            targetY += (this.character.y < enemy.y) ? -distance : distance;
        }
        let minX = this.level.level_start_x;
        let maxX = this.level.level_end_x - this.character.width;
        targetX = Math.min(maxX, Math.max(minX, targetX));
        this.character.knockbackActive = true;
        this.character.knockbackStartX = this.character.x;
        this.character.knockbackStartY = this.character.y;
        this.character.knockbackTargetX = targetX;
        this.character.knockbackTargetY = targetY;
        this.character.knockbackElapsed = 0;
    }

    checkCollision(){
        this.level.enemies.forEach((enemy) =>{
        if (enemy.isDying) return;
        if(this.character.isColliding(enemy)) {
                this.character.hit(enemy.damage);
                this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR)
                if (enemy.knocksBack) {
                    this.applyKnockback(enemy);
                }
            }
        })
    }

    checkCoinCollision() {
        for (let i = this.level.coins.length - 1; i >= 0; i--){
            let coin = this.level.coins[i];
            if (coin.collectOnTouch && this.character.isColliding(coin)) {
                this.level.coins.splice(i, 1);
                this.collectedCoins += coin.value;
                let percentage = (this.collectedCoins / this.totalCoins) * 100;
                this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
            }
        }
    }
    
    checkCoinHit(){
        let hitSomething = false;
        for (let i = this.level.coins.length - 1; i >= 0; i--){ // Rückwärts itterieren, damit das Entfernen (splice) während des  Durchlaufs keine Coins überspringt
            let coin = this.level.coins[i];
            if (!coin.collectOnTouch && this.character.isNear(coin)) {
                coin.value--;
                this.collectedCoins++;
                hitSomething = true;
                let percentage = (this.collectedCoins / this.totalCoins) * 100;
                this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
                if (coin.value <= 0) {
                    this.level.coins.splice(i, 1);
                }
            }
        }
        return hitSomething;
    }

    checkFinSlapOnEnemies(){
        let hitSomething = false;
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDying) return;
            if (enemy.constructor.name !== 'Pufferfish') return;
            if (!this.character.isNear(enemy)) return;

            let facingLeft = !enemy.otherDirection;
            let characterInFront = facingLeft 
                ? (this.character.x + this.character.width / 2) <= (enemy.x + enemy.width / 2)
                : (this.character.x + this.character.width / 2) >= (enemy.x + enemy.width / 2);

            if (characterInFront) {
                // von Vorne: Stacheln, Sharkie bekommt selber schaden
                this.character.hit(enemy.damage);
                this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR);
            } else {
                // von Hinten: Fin Slap trifft, 2 schaden
                enemy.health -= 2;
                hitSomething = true;
                if(enemy.health <= 0){
                    enemy.startDying();
                    this.awardExperience(200, enemy);
                }
            }
        });
        return hitSomething;
    }

    checkBubbleHitOnEnemies(){
        for (let i = this.firingObjects.length - 1; i >= 0; i--){
            let bubble = this.firingObjects[i];
            if (bubble instanceof PoisonBubble) continue; // nur Normale Bubble

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                let enemy = this.level.enemies[j];
                if (enemy.isDying) continue;
                if (bubble.isColliding(enemy)) {
                    enemy.health -= 1;
                    this.firingObjects.splice(i, 1);
                    if (enemy.health <= 0) {
                        enemy.startDying();
                        this.awardExperience(100, enemy)
                    }
                    break;
                }
            }
        }
    }

    checkPoisonCollision(){
        for (let i = this.level.poisons.length - 1; i >= 0; i--) {
            let poison = this.level.poisons[i];
            if (poison.collectOnTouch && this.character.isColliding(poison)) {
                this.level.poisons.splice(i, 1);
                this.collectedPoisons += poison.value;
                let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
                this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
            }
        }
    }

    checkNetTrigger(){
        if (!this.netTriggered) {
            if (this.character.x < this.level.net.x + this.level.net.width) return;
            this.netTriggered = true;
            this.character.isFrozen = true;
            this.character.showingConfusion = true;
            this.character.confusionFrame = 0;
            this.character.confusionTimer = 0;
            this.character.otherDirection = true;  // zum Netz umdrehen
            this.level.net.startUnrolling();
            return;
        }
        if (this.character.isFrozen && this.level.net.unrollDone) {
            this.character.isFrozen = false;
            this.character.showingConfusion = false;
        }
    }

    drawConfusion() {
        if (!this.character.showingConfusion) return;
        let bounceOffsets = [0, -6, -10, -6];
        let baseX = this.character.x + this.character.width / 2;
        let baseY = this.character.y + this.character.offset.top - 20;
        this.ctx.save();
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'white';
        let marks = [-24, 0, 24];
        marks.forEach((dx, i) => {
            let offsetIndex = (this.character.confusionFrame + i) % bounceOffsets.length;
            let y = baseY + bounceOffsets[offsetIndex];
            this.ctx.strokeText('?', baseX + dx, y);
            this.ctx.fillText('?', baseX + dx, y);
        });
        this.ctx.restore();
    }
}