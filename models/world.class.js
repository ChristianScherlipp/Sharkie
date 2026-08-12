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
    gameEnded = false; // true = Game-Loop stoppt komplett (Game Over oder letztes Level gewonnen)
    gameWinning = false;  // true, sobald der Finalboss besiegt ist (verhindert Mehrfachauslösung)
    // true, während das Pausemenü offen ist - Loop läuft weiter (damit ein
    // Resume nicht springt), Update/Draw werden aber übersprungen
    paused = false;
    // Wird in loadLevel() anhand der Levelnummer gesetzt.
    isLastLevel = true;
    coinBar = new Coinbar();
    healthBar = new Healthbar();
    posionBar = new Posionbar();
    firingObjects = [];
    lastTime = 0;
    collisionTimer = 0;

    // Gesamtwert aller Coins/Poisons im Level (vor dem Einsammeln), für die
    // Prozent-Berechnung - Summe der einzelnen Werte, nicht die Anzahl, damit
    // BigCoins mit ihrem höheren Wert korrekt mitzählen. Wird in loadLevel() gesetzt.
    totalCoins = 0;
    collectedCoins = 0;

    totalPoisons = 0;
    collectedPoisons = 0;

    // Erfahrungspunkte: +100 für einen Bubble-Kill (egal welcher Gegner),
    // +200 für einen Fin-Slap-Kill (aktuell nur beim Pufferfish möglich).
    experience = 0;

    // Kleine "+100"/"+200"-Texte, die kurz über dem getöteten Gegner
    // hochsteigen und dabei ausblenden (siehe awardExperience()).
    xpPopups = [];

    netTriggered = false;

    // Feste Referenz auf den Boss, damit World ihn nicht jeden Frame neu
    // suchen muss (checkNetTrigger blendet ab hier auch seine Healthbar ein).
    // Wird in loadLevel() gesetzt.
    finalboss;
    showFinalbossHealthbar = false;

    // rote "-2"/"-5"-Texte für Gegner-Treffer (z.B. Gift-Tick), gleiches
    // Prinzip wie xpPopups, nur andere Farbe.
    damagePopups = [];

    // Kleine Coin-Icons, die kurz über einer getroffenen BigCoin hochsteigen
    // und dabei ausblenden - gleiches Prinzip wie xpPopups/damagePopups,
    // nur wird statt Text ein Bild gezeichnet (siehe showCoinPopup()).
    coinPopups = [];

    // Boss-Erschein-Sequenz: 'pending' -> 'panning' (Kamera schwenkt zum
    // letzten Abschnitt) -> introducing (Erschein-Animation-läuft) -> 'done'
    bossIntroPhase = 'pending';
    cameraPanStartX = 0;
    cameraPanTargetX = 0;
    cameraPanElapsed = 0;
    cameraPanDuration = 1500;

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

    // Lädt das gewünschte Level (aktuell 1 oder 2) und berechnet die davon
    // abhängigen Werte: Gesamt-Coins/-Poisons für die Prozent-Anzeigen, die
    // feste Boss-Referenz, und ob es das letzte Level ist.
    loadLevel(levelNumber){
        this.level = levelNumber === 2 ? createLevl2() : createLevl1();
        this.totalCoins = this.level.coins.reduce((sum, coin) => sum + coin.value, 0);
        this.totalPoisons = this.level.poisons.reduce((sum, poison) => sum + poison.value, 0);
        this.finalboss = this.level.enemies.find(e => e instanceof Finalboss);
        this.isLastLevel = levelNumber >= 2;
    }

    // Zentraler Game-Loop läuft über requestAnimationFrame,
    // ersetzt alle vorherigen setIntervals im Projekt.
    // Sobald gameEnded true ist (Game Over oder letztes Level gewonnen),
    // wird kein weiterer Frame mehr angefordert - der letzte gezeichnete
    // Frame (z.B. Sharkies letztes Todes-Bild) bleibt so sichtbar stehen.
    // Solange paused true ist, läuft die Schleife zwar weiter (damit lastTime
    // aktuell bleibt), überspringt aber Update/Draw komplett - so springt die
    // Zeit beim Fortsetzen nicht.
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

    pause(){
        this.paused = true;
    }

    resume(){
        this.paused = false;
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
        this.checkLevelTransition();
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
        this.removeExpiredBubbles();
    }

    // Blasen (normale UND Gift-Blasen), die verfallen, platzen genauso
    // hörbar wie bei einem Treffer.
    removeExpiredBubbles(){
        let expired = this.firingObjects.filter(fo => fo.age >= 5000);
        expired.forEach(() => AudioHub.playOne(AudioHub.BUBBLE_BURST));
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

    // Entfernt zu Ende gestorbene Gegner sowie abgelaufene Popups.
    cleanupEntities(deltaTime){
        this.level.enemies = this.level.enemies.filter(enemy => !enemy.markedForRemoval);
        this.xpPopups = this.ageAndFilterPopups(this.xpPopups, deltaTime);
        this.damagePopups = this.ageAndFilterPopups(this.damagePopups, deltaTime);
        this.coinPopups = this.ageAndFilterPopups(this.coinPopups, deltaTime);
    }

    // Lässt eine Liste von Popups (XP/Schaden/Coin) altern und entfernt
    // abgelaufene - gemeinsame Hilfsfunktion für alle drei Popup-Arten.
    ageAndFilterPopups(popups, deltaTime){
        popups.forEach(popup => popup.elapsed += deltaTime);
        return popups.filter(popup => popup.elapsed < popup.duration);
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
    //   schwimmt automatisch nach rechts aus dem Canvas - das eigentliche
    //   Levelende folgt dann in checkLevelTransition().
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

    // Sobald Sharkie nach einem Levelsieg (nicht letztes Level) komplett aus
    // dem sichtbaren Bereich rausgeschwommen ist, wird das eigentliche
    // Levelende ausgelöst - der Game-Loop stoppt, game.js lädt darüber
    // (onLevelComplete-Callback) das nächste Level.
    checkLevelTransition(){
        if (!this.gameWinning || this.isLastLevel || this.gameEnded) return;
        let viewportRight = -this.camera_x + this.canvas.width;
        if (this.character.x > viewportRight) {
            this.gameEnded = true;
            if (this.callbacks.onLevelComplete) this.callbacks.onLevelComplete();
        }
    }

    setWorld(){
        this.character.world = this;
    }
}
// World wird auf mehrere Dateien aufgeteilt (max. 400 LOC pro Datei):
// world.class.js selbst enthält nur noch Felder, Game-Loop und die
// Update-Orchestrierung. Zeichnen (world-render), Kampf (world-combat),
// Sammeln/Schießen (world-items) und die Boss-Intro-Sequenz
// (world-boss-intro) leben in eigenen Mixin-Dateien und werden hier
// zusammengeführt - die Methoden verhalten sich exakt wie zuvor.
Object.assign(World.prototype, WorldRenderMixin, WorldCombatMixin, WorldItemsMixin, WorldBossIntroMixin);