import { Character } from "./character.class.js";
import { Coinbar } from "./coinbar.class.js";
import { Healthbar } from "./healthbar.class.js";
import { Posionbar } from "./posionbar-object.class.js";
import { FiringObject } from "./firing-object.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { Finalboss } from "./finalboss.class.js";
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

    // Gesamtwert aller Coins im Level (vor dem Einsammeln), für die Prozent-Berechnung.
    // Summe der einzelnen coin.value, nicht einfach die Anzahl - so zählen
    // BigCoins mit ihrem höheren Wert korrekt mit.
    totalCoins = this.level.coins.reduce((sum, coin) => sum + coin.value, 0);
    collectedCoins = 0;

    // Gesamtwert aller Poisons im Level (vor dem Einsammeln), für die Prozent-Berechnung.
    totalPoisons = this.level.poisons.reduce((sum, poison) => sum + poison.value, 0);
    collectedPoisons = 0;

    // Erfahrungspunkte: +100 für einen Bubble-Kill (egal welcher Gegner),
    // +200 für einen Fin-Slap-Kill (aktuell nur beim Pufferfish möglich).
    experience = 0;

    // Kleine "+100"/"+200"-Texte, die kurz über dem getöteten Gegner
    // hochsteigen und dabei ausblenden (siehe awardExperience()).
    xpPopups = [];

    // wird einmalig true, sobald Sharkie die Netz-Trigger-Position erreicht
    netTriggered = false;

    // feste Referenz auf den Boss, damit World ihn nicht jeden Frame neu
    // suchen muss (checkNetTrigger blendet ab hier auch seine Healthbar ein)
    finalboss = this.level.enemies.find(e => e instanceof Finalboss);
    showFinalbossHealthbar = false;

    // rote "-2"/"-5"-Texte für Gegner-Treffer (z.B. Gift-Tick), gleiches
    // Prinzip wie xpPopups, nur andere Farbe.
    damagePopups = [];

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
        this.level.enemies.forEach(enemy => enemy.update(deltaTime, this.character, this.level));
        this.level.coins.forEach(coin => coin.update(deltaTime));
        this.level.poisons.forEach(poison => poison.update(deltaTime));
        this.level.lights.forEach(light => light.update(deltaTime));
        this.level.net.update(deltaTime);
        this.firingObjects.forEach(fo => fo.update(deltaTime));

        this.checkNetTrigger();

        //Kollision lief früher alle 200ms per eigenem Interval,
        // das wird hier über einen zähler nachgebildet.
        this.collisionTimer += deltaTime;
        if (this.collisionTimer > 200) {
            this.checkCollision();
            this.collisionTimer = 0;
        }

        // Normale Coins: Berührung reicht. BigCoins (& Co): nur per Angriff.
        this.checkCoinCollision();
        this.checkPoisonCollision();

        if (this.character.justAttacked) {
            let hitCoin = this.checkCoinHit();
            let hitEnemy = this.checkFinSlapOnEnemies();
            this.character.lastAttackHit = hitCoin || hitEnemy;
            this.character.justAttacked = false;
        }

        // Bubble entsteht erst, wenn die Formations-Animation fertig ist
        // (siehe justFiredBubble in Character).
        this.checkFiringObjects();
        this.checkPoisonFiringObjects();

        this.checkBubbleHitOnEnemies();
        this.checkPoisonBubbleHitOnEnemies();

        // Boss-Sonderfälle: Healthbar-Sichtbarkeit, einmalige Todes-XP
        // (egal wodurch er gestorben ist), Gift-Tick-Popup.
        this.showFinalbossHealthbar = this.netTriggered;
        if (this.finalboss) {
            if (this.finalboss.isDying && !this.finalboss.xpAwarded) {
                this.finalboss.xpAwarded = true;
                this.awardExperience(5000, this.finalboss);
            }
            if (this.finalboss.justPoisonTicked) {
                this.finalboss.justPoisonTicked = false;
                this.showDamagePopup(this.finalboss.poisonTickDamage, this.finalboss);
            }
        }

        // Gegner, deren Sterbe-Animation fertig durchgelaufen ist, endgültig entfernen.
        this.level.enemies = this.level.enemies.filter(enemy => !enemy.markedForRemoval);

        // XP-Popups altern lassen und fertige entfernen.
        this.xpPopups.forEach(popup => popup.elapsed += deltaTime);
        this.xpPopups = this.xpPopups.filter(popup => popup.elapsed < popup.duration);

        // Schadens-Popups altern lassen und fertige entfernen.
        this.damagePopups.forEach(popup => popup.elapsed += deltaTime);
        this.damagePopups = this.damagePopups.filter(popup => popup.elapsed < popup.duration);
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
        this.drawDamagePopups();
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.drawExperience();
        this.drawFinalbossHealthbar();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.level.net);
        this.addToMap(this.character); // Character laden
        this.drawConfusion();
        this.ctx.translate(-this.camera_x, 0);
    }

    // Zeichnet 3 bouncende "?" über Sharkies Kopf, solange showingConfusion
    // true ist - als Text statt Bild, da hierfür kein Asset vorliegt.
    drawConfusion(){
        if (!this.character.showingConfusion) return;

        let bounceOffsets = [0, -6, -10, -6];
        let baseX = this.character.x + this.character.width / 2;
        // relativ zur tatsächlichen Kopf-Hitbox (offset.top), nicht zur rohen
        // Sprite-Oberkante - da oben ist sonst viel leerer Platz im Bild.
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

    // Erhöht die Gesamt-XP und erzeugt einen "+100"/"+200"-Popup über dem
    // Gegner, der gerade getötet wurde.
    awardExperience(amount, enemy){
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

    // Zeichnet die XP-Popups in Weltkoordinaten (bewegt sich mit der Kamera,
    // wird deshalb im "Welt"-Bereich von draw() aufgerufen, nicht im HUD-Teil).
    drawXpPopups(){
        this.xpPopups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            let alpha = 1 - t;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeText(popup.text, popup.x, y);
            this.ctx.fillStyle = 'yellow';
            this.ctx.fillText(popup.text, popup.x, y);
            this.ctx.restore();
        });
    }

    // Erzeugt einen roten "-2"-Popup über einem Gegner (z.B. Gift-Tick-Schaden).
    showDamagePopup(amount, enemy){
        this.damagePopups.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y,
            text: `-${amount}`,
            elapsed: 0,
            duration: 800,
            riseDistance: 75
        });
    }

    // Gleiches Prinzip wie drawXpPopups(), nur rot statt gelb.
    drawDamagePopups(){
        this.damagePopups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            let alpha = 1 - t;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeText(popup.text, popup.x, y);
            this.ctx.fillStyle = 'red';
            this.ctx.fillText(popup.text, popup.x, y);
            this.ctx.restore();
        });
    }

    // Boss-Healthbar: nur sichtbar, sobald Sharkie hinter dem Netz ist.
    // Reine Canvas-Zeichnung (Rechtecke), da hierfür kein Bild-Asset vorliegt.
    drawFinalbossHealthbar(){
        if (!this.showFinalbossHealthbar || !this.finalboss) return;

        let barWidth = 150;
        let barHeight = 18;
        let x = this.canvas.width - barWidth - 20;
        let y = 20;
        let radius = 8;
        let pct = Math.max(0, this.finalboss.health / this.finalboss.maxHealth);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, radius);
        this.ctx.fillStyle = '#3a0d0d';
        this.ctx.fill();

        let fillWidth = barWidth * pct;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, fillWidth, barHeight, radius);
        this.ctx.fillStyle = '#e0334d';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, radius);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        let healthText = Math.max(0, Math.round(this.finalboss.health));
        this.ctx.fillText(`Boss: ${healthText}/${this.finalboss.maxHealth}`, x + barWidth / 2, y + barHeight / 2);
        this.ctx.restore();
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

    // Löst einmalig die Netz-Sequenz aus, sobald Sharkie die Trigger-Position
    // erreicht: Sharkie friert ein, dreht sich zum Netz um und zeigt
    // Verwunderung, während sich das Netz hinter ihm ausrollt. Sobald das
    // Netz fertig ausgerollt ist, wird Sharkie wieder freigegeben.
    checkNetTrigger(){
        if (!this.netTriggered) {
            // Erst auslösen, wenn Sharkie komplett am Netz vorbei ist (nicht
            // nur die linke Kante erreicht) - sonst überlappt sein Körper
            // (250px) noch die Netz-Zone (75px), und er bleibt beim Blockieren
            // an sich selbst hängen.
            if (this.character.x < this.level.net.x + this.level.net.width) return;

            this.netTriggered = true;
            this.character.isFrozen = true;
            this.character.showingConfusion = true;
            this.character.confusionFrame = 0;
            this.character.confusionTimer = 0;
            // zum Netz umdrehen (liegt jetzt hinter/links von Sharkie)
            this.character.otherDirection = true;
            this.level.net.startUnrolling();
            return;
        }

        if (this.character.isFrozen && this.level.net.unrollDone) {
            this.character.isFrozen = false;
            this.character.showingConfusion = false;
        }
    }


    checkFiringObjects(){
        if (this.character.justFiredBubble) {
            this.character.justFiredBubble = false;
            let direction = this.character.otherDirection ? -1 : 1;
            let spawnX = this.character.otherDirection
                ? this.character.x - 20
                : this.character.x + this.character.width - 60;
            let bubble = new FiringObject(spawnX, this.character.y + 150, direction);
            this.firingObjects.push(bubble);
        }
    }

    // Gift-Schuss ('q'): gleicher Ablauf wie die Bubble, nur mit eigener
    // Formations-Animation in Character (IMAGES_POISON_FORMATION).
    checkPoisonFiringObjects(){
        if (this.character.justFiredPoison) {
            this.character.justFiredPoison = false;

            // Gift-Munition verbrauchen und Anzeige aktualisieren
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

    // Fin Slap gegen Gegner: nur Pufferfish reagiert darauf, und nur, wenn er
    // von HINTEN getroffen wird (er schaut in die entgegengesetzte Richtung).
    // Von vorne hat er die Stacheln oben - Sharkie bekommt dann selbst Schaden.
    // Jellyfish reagiert überhaupt nicht auf Fin Slap.
    checkFinSlapOnEnemies(){
        let hitSomething = false;
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDying) return;
            let isPufferfish = enemy.constructor.name === 'Pufferfish';
            let isFinalboss = enemy instanceof Finalboss;
            if (!isPufferfish && !isFinalboss) return;
            if (!this.character.isNear(enemy)) return;

            // Blickrichtung des Gegners: false = links, true = rechts
            // (gleiche Konvention wie bei der Erkennung).
            let facingLeft = !enemy.otherDirection;
            let characterInFront = facingLeft
                ? (this.character.x + this.character.width / 2) <= (enemy.x + enemy.width / 2)
                : (this.character.x + this.character.width / 2) >= (enemy.x + enemy.width / 2);

            if (characterInFront) {
                // von vorne: Stacheln oben, Sharkie bekommt selbst Schaden
                this.character.hit(enemy.damage);
                this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR);
            } else if (isPufferfish) {
                // von hinten: Fin Slap trifft, macht 2 Schaden
                enemy.health -= 2;
                hitSomething = true;
                if (enemy.health <= 0) {
                    enemy.startDying();
                    this.awardExperience(200, enemy);
                }
            } else if (isFinalboss) {
                // von hinten: Fin Slap trifft den Boss, macht 2 Schaden
                // (Todes-XP läuft zentral über den Boss-Check in update())
                enemy.takeDamage(2);
                hitSomething = true;
            }
        });
        return hitSomething;
    }

    // Normale Bubble (kein PoisonBubble) gegen Gegner: Schaden richtet sich
    // nach bubble.currentDamage (fällt mit der Flugzeit ab, siehe
    // FiringObject). Funktioniert bei Pufferfish/Finalboss von vorne und
    // hinten, und ist der einzige Weg, Jellyfish zu treffen. Die Bubble
    // verschwindet beim Treffer, auch wenn der aktuelle Schaden schon 0 ist.
    checkBubbleHitOnEnemies(){
        for (let i = this.firingObjects.length - 1; i >= 0; i--) {
            let bubble = this.firingObjects[i];
            if (bubble instanceof PoisonBubble) continue;

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                let enemy = this.level.enemies[j];
                if (enemy.isDying) continue;
                if (bubble.isColliding(enemy)) {
                    let dmg = Math.round(bubble.currentDamage);
                    this.firingObjects.splice(i, 1);

                    if (enemy instanceof Finalboss) {
                        if (dmg > 0) enemy.takeDamage(dmg);
                    } else if (dmg > 0) {
                        enemy.health -= dmg;
                        if (enemy.health <= 0) {
                            enemy.startDying();
                            this.awardExperience(100, enemy);
                        }
                    }
                    break;
                }
            }
        }
    }

    // Gift-Schuss: macht nur dem Finalboss Schaden (Pufferfish/Jellyfish sind
    // immun und werden komplett ignoriert - der Schuss fliegt einfach durch).
    // Schaden richtet sich ebenfalls nach bubble.currentDamage. Zählt
    // zusätzlich als Gift-Treffer für die Vergiftungs-Mechanik.
    checkPoisonBubbleHitOnEnemies(){
        for (let i = this.firingObjects.length - 1; i >= 0; i--) {
            let bubble = this.firingObjects[i];
            if (!(bubble instanceof PoisonBubble)) continue;

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                let enemy = this.level.enemies[j];
                if (!(enemy instanceof Finalboss)) continue;
                if (enemy.isDying) continue;
                if (bubble.isColliding(enemy)) {
                    let dmg = Math.round(bubble.currentDamage);
                    this.firingObjects.splice(i, 1);
                    if (dmg > 0) enemy.takeDamage(dmg);
                    enemy.registerPoisonHit();
                    break;
                }
            }
        }
    }

    // Stößt Sharkie auf der Achse zurück, auf der die Überlappung mit dem
    // Gegner am geringsten ist (= die Achse, auf der die Kollision "passiert").
    // Springt nicht sofort, sondern setzt nur das Ziel - die eigentliche,
    // sanfte Bewegung dorthin passiert in Character.update().
    applyKnockback(enemy){
        let charLeft = this.character.rX, charRight = this.character.rX + this.character.rW;
        let charTop = this.character.rY, charBottom = this.character.rY + this.character.rH;
        let enemyLeft = enemy.rX, enemyRight = enemy.rX + enemy.rW;
        let enemyTop = enemy.rY, enemyBottom = enemy.rY + enemy.rH;

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

        // nicht über die Weltgrenzen hinaus stoßen
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

    // Läuft jeden Frame: normale Coins (collectOnTouch = true) werden einfach
    // durch Berühren eingesammelt.
    checkCoinCollision(){
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            let coin = this.level.coins[i];
            if (coin.collectOnTouch && this.character.isColliding(coin)) {
                this.level.coins.splice(i, 1);
                this.collectedCoins += coin.value;
                let percentage = (this.collectedCoins / this.totalCoins) * 100;
                this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
            }
        }
    }

    // Wird genau einmal pro Angriff aufgerufen (siehe justAttacked in Character).
    // Nur Coins mit collectOnTouch = false (z.B. BigCoin) reagieren darauf.
    // Jeder Treffer verringert coin.value um 1 und erhöht collectedCoins um 1 -
    // fällt coin.value auf 0, verschwindet die Münze aus dem Level.
    checkCoinHit(){
        let hitSomething = false;
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
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

    // Läuft jeden Frame: Poisons werden durch Berühren eingesammelt,
    // genau wie normale Coins.
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
}
