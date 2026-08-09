import { Character } from "./character.class.js";
import { Coinbar } from "./coinbar.class.js";
import { Healthbar } from "./healthbar.class.js";
import { Posionbar } from "./posionbar-object.class.js";
import { FiringObject } from "./firing-object.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { Finalboss } from "./finalboss.class.js";
import { Jellyfish } from "./jellyfish.class.js";
import { createLevl1 } from "../levels/level1.js"
import { Light } from "./light.class.js";
 
export class World {
    character = new Character();
    level = createLevl1();
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    callbacks = {};
    gameEnded = false; // true = Game-Loop stoppt komplett (Game Over oder letztes Level gewonnen)
    gameWinning = false;  // true, sobald der Finalboss besiegt ist (verhindert Mehrfachauslösung)
    // Es existiert aktuell nur level1 - sobald es weitere Level gibt, muss
    // diese Prüfung durch eine echte "gibt es ein nächstes Level"-Logik
    // ersetzt werden.
    isLastLevel = true;
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
 
    netTriggered = false;
 
    // feste Referenz auf den Boss, damit World ihn nicht jeden Frame neu
    // suchen muss (checkNetTrigger blendet ab hier auch seine Healthbar ein)
    finalboss = this.level.enemies.find(e => e instanceof Finalboss);
    showFinalbossHealthbar = false;
 
    // rote "-2"/"-5"-Texte für Gegner-Treffer (z.B. Gift-Tick), gleiches
    // Prinzip wie xpPopups, nur andere Farbe.
    damagePopups = [];
 
    // Boss-Erschein-Sequenz: 'pending' -> 'panning' (Kamera schwenkt zum
    // letzten Abschnitt) -> introducing (Erschein-Animation-läuft) -> 'done'
    bossIntroPhase = 'pending';
    cameraPanStartX = 0;
    cameraPanTargetX = 0;
    cameraPanElapsed = 0;
    cameraPanDuration = 1500;
 
    constructor(canvas, keyboard, callbacks = {}) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.callbacks = callbacks;
        this.setWorld();
        this.lastTime = performance.now();
        this.run();
    }
 
    // Zentraler Game-Loop läuft über requestAnimationFrame,
    // ersetzt alle vorherigen setIntervals im Projekt.
    // Sobald gameEnded true ist (Game Over oder letztes Level gewonnen),
    // wird kein weiterer Frame mehr angefordert - der letzte gezeichnete
    // Frame (z.B. Sharkies letztes Todes-Bild) bleibt so sichtbar stehen.
    run(time = performance.now()){
        let deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.update(deltaTime);
        this.draw();
        if (!this.gameEnded) {
            requestAnimationFrame((t) => this.run(t));
        }
    }
 
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
    }
 
    // Bewegt/animiert alle Level-Objekte (Sharkie, Gegner, Coins, Poisons,
    // Lichter, Netz).
    updateEntities(deltaTime){
        this.character.update(deltaTime);
        this.level.enemies.forEach(enemy => enemy.update(deltaTime, this.character, this.level));
        this.level.coins.forEach(coin => coin.update(deltaTime));
        this.level.poisons.forEach(poison => poison.update(deltaTime));
        this.level.lights.forEach(light => light.update(deltaTime));
        this.level.net.update(deltaTime);
    }
 
    // Bewegt alle Blasen und entfernt welche, die 5 Sekunden lang nichts
    // getroffen haben (z.B. ins Leere geschossen) - sonst würden sie für
    // immer weiter aktualisiert und gezeichnet.
    updateFiringObjects(deltaTime){
        this.firingObjects.forEach(fo => fo.update(deltaTime));
        this.firingObjects = this.firingObjects.filter(fo => fo.age < 5000);
        }
 
    // Kollision lief früher alle 200ms per eigenem Interval, das wird hier
    // über einen Zähler nachgebildet.
    updateCollisionTimer(deltaTime){
        this.collisionTimer += deltaTime;
        if (this.collisionTimer > 200) {
            this.checkCollision();
            this.collisionTimer = 0;
        }
    }
 
    // Einsammeln (Coins/Poisons) läuft jeden Frame, Angriffstreffer nur genau
    // einmal pro Angriff und neue Schüsse nur, wenn gerade abgefeuert wurde.
    updateCollectionAndAttacks(){
        this.checkCoinCollision();
        this.checkPoisonCollision();
        this.checkAttackHits();
        this.checkFiringObjects();
        this.checkPoisonFiringObjects();
        this.checkBubbleHitOnEnemies();
        this.checkPoisonBubbleHitOnEnemies();
    }
 
    checkAttackHits(){
        if (!this.character.justAttacked) return;
        let hitCoin = this.checkCoinHit();
        let hitEnemy = this.checkFinSlapOnEnemies();
        this.character.lastAttackHit = hitCoin || hitEnemy;
        this.character.justAttacked = false;
    }
 
    // Boss-Sonderfälle: Healthbar-Sichtbarkeit, einmalige Todes-XP (egal
    // wodurch er gestorben ist), Gift-Tick-Popup.
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
 
    // Entfernt zu Ende gestorbene Gegner sowie abgelaufene XP-/Schadens-Popups.
    cleanupEntities(deltaTime){
        this.level.enemies = this.level.enemies.filter(enemy => !enemy.markedForRemoval);
        this.xpPopups.forEach(popup => popup.elapsed += deltaTime);
        this.xpPopups = this.xpPopups.filter(popup => popup.elapsed < popup.duration);
        this.damagePopups.forEach(popup => popup.elapsed += deltaTime);
        this.damagePopups = this.damagePopups.filter(popup => popup.elapsed < popup.duration);
    }
 
    // Sobald Sharkies Todes-Animation komplett durchgelaufen ist
    // (Character setzt dann markedForRemoval via updateDying()), wird
    // einmalig alles angehalten und der Game-Over-Screen ausgelöst.
    checkGameOver() {
        if (this.gameEnded || this.gameWinning) return;
        if (this.character.markedForRemoval) {
            this.gameEnded = true;
            if (this.callbacks.onGameOver) this.callbacks.onGameOver();
        }
    }
 
    // Sobald der Finalboss' Todes-Animation komplett durchgelaufen ist,
    // entscheidet isLastLevel, welche der beiden Sieg-Varianten greift:
    // - letztes Level: Bild deckt das komplette Canvas ab, gleiche Buttons
    //   wie bei Game Over (alles wird angehalten).
    // - nicht letztes Level: nur ein Banner fährt von oben rein, Sharkie
    //   schwimmt automatisch nach rechts aus dem Canvas (Spiel läuft weiter,
    //   bis es ein echtes Folge-Level gibt).
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
 
    draw(){
        // Canvas Clearen um neu geladenen bilder anzuzeigen
        // und das vorgänger bild aus dem canvas entfernt wird.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.drawWorldLayer();
        this.ctx.translate(-this.camera_x, 0);
        this.drawHud();
        this.ctx.translate(this.camera_x, 0);
        this.drawForegroundLayer();
        this.ctx.translate(-this.camera_x, 0);
    }
 
    // Alles, was sich mit der Kamera mitbewegt: Hintergrund, Licht, Gegner,
    // Coins, Poisons, XP-/Schadens-Popups.
    drawWorldLayer(){
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.lights);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.poisons);
        this.drawPopups(this.xpPopups, 'yellow');
        this.drawPopups(this.damagePopups, 'red');
    }
 
    // HUD: fest auf dem Bildschirm, bewegt sich nicht mit der Kamera.
    drawHud(){
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.drawExperience();
        this.drawFinalbossHealthbar();
    }
 
    // Wieder mit Kamera-Versatz: Blasen, Netz, Sharkie selbst.
    drawForegroundLayer(){
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.level.net);
        this.addToMap(this.character);
        this.drawConfusion();
    }
 
    // Zeichnet 3 bouncende "?" über Sharkies Kopf, solange showingConfusion
    // true ist - als Text statt Bild, da hierfür kein Asset vorliegt.
    drawConfusion(){
        if (!this.character.showingConfusion) return;
        let baseX = this.character.x + this.character.width / 2;
        // relativ zur tatsächlichen Kopf-Hitbox (offset.top), nicht zur rohen
        // Sprite-Oberkante - da oben ist sonst viel leerer Platz im Bild.
        let baseY = this.character.y + this.character.offset.top - 20;
 
        this.ctx.save();
        this.setConfusionTextStyle();
        this.drawConfusionMarks(baseX, baseY);
        this.ctx.restore();
    }
 
    setConfusionTextStyle(){
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'white';
    }
 
    drawConfusionMarks(baseX, baseY){
        let bounceOffsets = [0, -6, -10, -6];
        let marks = [-24, 0, 24];
        marks.forEach((dx, i) => {
            let offsetIndex = (this.character.confusionFrame + i) % bounceOffsets.length;
            let y = baseY + bounceOffsets[offsetIndex];
            this.ctx.strokeText('?', baseX + dx, y);
            this.ctx.fillText('?', baseX + dx, y);
        });
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

    // Gemeinsame Zeichenroutine für XP- (gelb) und Schadens- (rot) Popups -
    // beide funktionierten vorher identisch in zwei fast gleichen Methoden,
    // nur Array und Farbe unterschieden sich.
    drawPopups(popups, color){
        popups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            this.ctx.save();
            this.ctx.globalAlpha = 1 - t;
            this.setPopupTextStyle();
            this.ctx.strokeText(popup.text, popup.x, y);
            this.ctx.fillStyle = color;
            this.ctx.fillText(popup.text, popup.x, y);
            this.ctx.restore();
        });
    }

     setPopupTextStyle(){
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
    }
 
    // Boss-Healthbar: nur sichtbar, sobald Sharkie hinter dem Netz ist.
    // Reine Canvas-Zeichnung (Rechtecke), da hierfür kein Bild-Asset vorliegt.
    drawFinalbossHealthbar(){
        if (!this.showFinalbossHealthbar || !this.finalboss) return;
        let bar = { x: this.canvas.width - 170, y: 20, width: 150, height: 18, radius: 8 };
        let pct = Math.max(0, this.finalboss.health / this.finalboss.maxHealth);
 
        this.ctx.save();
        this.drawHealthbarBackground(bar);
        this.drawHealthbarFill(bar, pct);
        this.drawHealthbarBorder(bar);
        this.drawHealthbarText(bar);
        this.ctx.restore();
    }
 
    drawHealthbarBackground(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.fillStyle = '#3a0d0d';
        this.ctx.fill();
    }
 
    drawHealthbarFill(bar, pct){
        let fillWidth = bar.width * pct;
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, fillWidth, bar.height, bar.radius);
        this.ctx.fillStyle = '#e0334d';
        this.ctx.fill();
        }
 
    drawHealthbarBorder(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
 
    drawHealthbarText(bar){
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        let healthText = Math.max(0, Math.round(this.finalboss.health));
        this.ctx.fillText(`Boss: ${healthText}/${this.finalboss.maxHealth}`, bar.x + bar.width / 2, bar.y + bar.height / 2);
    }
 
    drawExperience(){
        let text = String(this.experience).padStart(6, '0');
        let x = this.canvas.width / 2;

        this.ctx.save();
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeText(text, x, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, 30);
        this.ctx.restore();
    }
 
    addObjectsToMap (objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }
 
    addToMap (mo){
        if (mo.hasAppeared === false) return;
 
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
    // erreicht, und startet danach den Kamera-Schwenk zum Boss-Bereich,
    // sobald das Netz fertig ausgerollt ist.
    checkNetTrigger(){
        if (!this.netTriggered) {
            this.tryTriggerNet();
            return;
        }
        this.tryStartCameraPan();
    }
 
    // Sharkie friert ein, dreht sich zum Netz um und zeigt Verwunderung.
    tryTriggerNet(){
        // Erst auslösen, wenn Sharkie komplett am Netz vorbei ist (nicht nur
        // die linke Kante erreicht) - sonst überlappt sein Körper (250px)
        // noch die Netz-Zone (75px), und er bleibt an sich selbst hängen.
        if (this.character.x < this.level.net.x + this.level.net.width) return;
 
        this.netTriggered = true;
        this.character.isFrozen = true;
        this.character.showingConfusion = true;
        this.character.confusionFrame = 0;
        this.character.confusionTimer = 0;
        this.character.otherDirection = true; // zum Netz umdrehen
        this.level.net.startUnrolling();
    }
 
    // Netz fertig: Verwunderung abschalten, Kamera-Schwenk starten
    // (Sharkie bleibt eingefroren, siehe updateBossIntro()).
    tryStartCameraPan(){
        if (!this.character.isFrozen || !this.level.net.unrollDone) return;
        if (this.bossIntroPhase !== 'pending') return;
 
        this.character.showingConfusion = false;
        this.bossIntroPhase = 'panning';
        this.cameraPanStartX = this.camera_x;
        this.cameraPanTargetX = this.canvas.width - this.level.level_end_x;
        this.cameraPanElapsed = 0;
    }
 
    updateBossIntro(deltaTime) {
        if (this.bossIntroPhase === 'panning') {
            this.updateCameraPan(deltaTime);
        } else if (this.bossIntroPhase === 'introducing'){
            this.checkIntroComplete();
        }
    }
 
    updateCameraPan(deltaTime){
        this.cameraPanElapsed += deltaTime;
        let t = Math.min(this.cameraPanElapsed / this.cameraPanDuration, 1);
        let eased = 1 - Math.pow(1 - t, 3); // Ease-out, wie beim Rückstoß
        this.camera_x = this.cameraPanStartX + (this.cameraPanTargetX - this.cameraPanStartX) * eased;
        if (t >= 1) {
            this.bossIntroPhase = 'introducing';
            if (this.finalboss) this.finalboss.startIntroducing();
        }
    }
 
    checkIntroComplete(){
        if (this.finalboss && this.finalboss.introduced) {
            this.bossIntroPhase = 'done';
            this.character.isFrozen = false;
        }
    }
 
    // Gemeinsame Spawn-Position für Bubble/Gift-Schuss: seitlich neben
    // Sharkie, abhängig von der Blickrichtung (war vorher in beiden
    // check*FiringObjects()-Methoden dupliziert).
    getShotSpawnPosition(){
        let direction = this.character.otherDirection ? -1 : 1;
        let x = this.character.otherDirection
            ? this.character.x - 20
            : this.character.x + this.character.width - 60;
        return { x, y: this.character.y + 150, direction };
    }
 
    checkFiringObjects(){
        if (!this.character.justFiredBubble) return;
        this.character.justFiredBubble = false;
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new FiringObject(spawn.x, spawn.y, spawn.direction));
    }
 
    // Gift-Schuss ('q'): gleicher Ablauf wie die Bubble, nur mit eigener
    // Formations-Animation in Character (IMAGES_POISON_FORMATION) und
    // Munitionsverbrauch.
    checkPoisonFiringObjects(){
        if (!this.character.justFiredPoison) return;
        this.character.justFiredPoison = false;
        this.consumePoisonAmmo();
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new PoisonBubble(spawn.x, spawn.y, spawn.direction));
    }
 
    consumePoisonAmmo(){
        this.collectedPoisons--;
        let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
        this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
    }
 
    checkCollision(){
        this.level.enemies.forEach((enemy) =>{
                if (enemy.isDying) return;
                if (enemy instanceof Finalboss && !enemy.introduced) return;
                if(this.character.isColliding(enemy)) {
                    this.character.hit(enemy.damage);
                    this.character.lastHitByJellyfish = enemy instanceof Jellyfish;
                    this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR)
 
                    if (enemy.knocksBack) {
                        this.applyKnockback(enemy);
                    }
                }
            })
    }

    // Fin Slap gegen Gegner: nur Pufferfish/Finalboss reagieren, und nur von
    // HINTEN (Pufferfish hat die Stacheln von vorne oben - Sharkie bekommt
    // dann selbst Schaden). Jellyfish reagiert überhaupt nicht auf Fin Slap.
    checkFinSlapOnEnemies(){
        let hitSomething = false;
        this.level.enemies.forEach((enemy) => {
            if (!this.canFinSlapReach(enemy)) return;
            if (this.isEnemyFacingCharacter(enemy)) {
                this.punishFrontalFinSlap(enemy);
            } else if (this.applyFinSlapDamage(enemy)) {
                hitSomething = true;
            }
        });
        return hitSomething;
    }
 
    // Fin Slap trifft nur Pufferfish/Finalboss, und nur wenn Sharkie nah genug ist.
    canFinSlapReach(enemy){
        if (enemy.isDying) return false;
        let isPufferfish = enemy.constructor.name === 'Pufferfish';
        let isFinalboss = enemy instanceof Finalboss;
        if (!isPufferfish && !isFinalboss) return false;
        if (isFinalboss && !enemy.introduced) return false;
        return this.character.isNear(enemy);
    }
 
    // Blickrichtung des Gegners: false = links, true = rechts (gleiche
    // Konvention wie bei der Erkennung). true = Sharkie steht vor ihm.
    isEnemyFacingCharacter(enemy){
        let facingLeft = !enemy.otherDirection;
        let charCenterX = this.character.x + this.character.width / 2;
        let enemyCenterX = enemy.x + enemy.width / 2;
        return facingLeft ? charCenterX <= enemyCenterX : charCenterX >= enemyCenterX;
    }
 
    // Von vorne: Gegner hat die Stacheln oben, Sharkie bekommt selbst Schaden.
    punishFrontalFinSlap(enemy){
        this.character.hit(enemy.damage);
        this.character.lastHitByJellyfish = false;
        this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR);
    }
 
    // Von hinten: Fin Slap trifft den Gegner (2 Schaden). Gibt true zurück.
    applyFinSlapDamage(enemy){
        if (enemy instanceof Finalboss) {
            enemy.takeDamage(2);
            return true;
        }
        enemy.health -= 2;
        if (enemy.health <= 0) {
            enemy.startDying();
            this.awardExperience(200, enemy);
        }
        return true;
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
            this.checkBubbleAgainstEnemies(bubble, i);
        }
    }
 
    checkBubbleAgainstEnemies(bubble, bubbleIndex){
        for (let j = this.level.enemies.length - 1; j >= 0; j--) {
            let enemy = this.level.enemies[j];
            if (enemy.isDying) continue;
            if (enemy instanceof Finalboss && !enemy.introduced) continue;
            if (bubble.isColliding(enemy)) {
                this.firingObjects.splice(bubbleIndex, 1);
                this.applyBubbleDamage(enemy, Math.round(bubble.currentDamage));
                break;
            }
        }
    }
 
    applyBubbleDamage(enemy, dmg){
        if (enemy instanceof Finalboss) {
            if (dmg > 0) enemy.takeDamage(dmg);
            return;
        }
        if (dmg <= 0) return;
        enemy.health -= dmg;
        if (enemy.health <= 0) {
            enemy.startDying();
            this.awardExperience(100, enemy);
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
            this.checkPoisonBubbleAgainstBoss(bubble, i);
        }
    }
 
    checkPoisonBubbleAgainstBoss(bubble, bubbleIndex){
        for (let j = this.level.enemies.length - 1; j >= 0; j--) {
            let enemy = this.level.enemies[j];
            if (!(enemy instanceof Finalboss)) continue;
            if (enemy.isDying || !enemy.introduced) continue;
            if (bubble.isColliding(enemy)) {
                let dmg = Math.round(bubble.currentDamage);
                this.firingObjects.splice(bubbleIndex, 1);
                if (dmg > 0) enemy.takeDamage(dmg);
                enemy.registerPoisonHit();
                break;
            }
        }
    }
 
    // Stößt Sharkie auf der Achse zurück, auf der die Überlappung mit dem
    // Gegner am geringsten ist (= die Achse, auf der die Kollision "passiert").
    // Springt nicht sofort, sondern setzt nur das Ziel - die eigentliche,
    // sanfte Bewegung dorthin passiert in Character.update().
    applyKnockback(enemy){
        let target = this.getKnockbackTarget(enemy);
        this.character.knockbackActive = true;
        this.character.knockbackStartX = this.character.x;
        this.character.knockbackStartY = this.character.y;
        this.character.knockbackTargetX = target.x;
        this.character.knockbackTargetY = target.y;
        this.character.knockbackElapsed = 0;
    }
 
    // Berechnet den Zielpunkt: auf der Achse mit der geringeren Überlappung,
    // begrenzt auf die Levelgrenzen.
    getKnockbackTarget(enemy){
        let overlapX = Math.min(this.character.rX + this.character.rW, enemy.rX + enemy.rW) - Math.max(this.character.rX, enemy.rX);
        let overlapY = Math.min(this.character.rY + this.character.rH, enemy.rY + enemy.rH) - Math.max(this.character.rY, enemy.rY);
        let distance = enemy.knockbackDistance ?? 100;
        let targetX = this.character.x;
        let targetY = this.character.y;
        if (overlapX < overlapY) {
            targetX += (this.character.x < enemy.x) ? -distance : distance;
        } else {
            targetY += (this.character.y < enemy.y) ? -distance : distance;
        }
        let minX = this.level.level_start_x, maxX = this.level.level_end_x - this.character.width;
        return { x: Math.min(maxX, Math.max(minX, targetX)), y: targetY };
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
            if (this.hitBlockingCoin(this.level.coins[i], i)) hitSomething = true;
        }
        return hitSomething;
    }
 
    hitBlockingCoin(coin, index){
        if (coin.collectOnTouch || !this.character.isNear(coin)) return false;
        coin.value--;
        this.collectedCoins++;
        let percentage = (this.collectedCoins / this.totalCoins) * 100;
        this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
        if (coin.value <= 0) this.level.coins.splice(index, 1);
        return true;
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