import { FiringObject } from "./firing-object.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { AudioHub } from "./audio-hub.class.js";

// Sammel-/Schuss-Methoden für World, ausgelagert damit world.class.js unter
// der 400-LOC-Grenze bleibt. Wird per Object.assign(World.prototype, ...) in
// world.class.js eingebunden - die Methoden greifen weiterhin ganz normal
// über "this" auf die World-Instanz zu.
export const WorldItemsMixin = {

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
    },

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
    },

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
                AudioHub.playOne(AudioHub.COIN_COLLECTED);
            }
        }
    },

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
    },

    // Statt des Fin-Slap-Schlagsounds (der schon beim Angriffsstart läuft)
    // hört man bei einer BicCoin den Münz-Sound.
    hitBlockingCoin(coin, index){
        if (coin.collectOnTouch || !this.character.isNear(coin)) return false;
        coin.value--;
        this.collectedCoins++;
        let percentage = (this.collectedCoins / this.totalCoins) * 100;
        this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
        if (coin.value <= 0) this.level.coins.splice(index, 1);
        AudioHub.stopOne(AudioHub.FIN_SLAP);
        AudioHub.playOne(AudioHub.COIN_COLLECTED);
        return true;
    },

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
    },

    // Gemeinsame Spawn-Position für Bubble/Gift-Schuss: seitlich neben
    // Sharkie, abhängig von der Blickrichtung (war vorher in beiden
    // check*FiringObjects()-Methoden dupliziert).
    getShotSpawnPosition(){
        let direction = this.character.otherDirection ? -1 : 1;
        let x = this.character.otherDirection
            ? this.character.x - 20
            : this.character.x + this.character.width - 60;
        return { x, y: this.character.y + 150, direction };
    },

    checkFiringObjects(){
        if (!this.character.justFiredBubble) return;
        this.character.justFiredBubble = false;
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new FiringObject(spawn.x, spawn.y, spawn.direction));
    },

    // Gift-Schuss ('q'): gleicher Ablauf wie die Bubble, nur mit eigener
    // Formations-Animation in Character (IMAGES_POISON_FORMATION) und
    // Munitionsverbrauch.
    checkPoisonFiringObjects(){
        if (!this.character.justFiredPoison) return;
        this.character.justFiredPoison = false;
        this.consumePoisonAmmo();
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new PoisonBubble(spawn.x, spawn.y, spawn.direction));
    },

    consumePoisonAmmo(){
        this.collectedPoisons--;
        let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
        this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
    },
};