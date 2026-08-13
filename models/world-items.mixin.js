import { FiringObject } from "./firing-object.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { AudioHub } from "./audio-hub.class.js";

export const WorldItemsMixin = {

    /**
     * Awards experience.
     * @param {number} amount - The amount to apply.
     * @param {MovableObject} enemy - The enemy to check/affect.
     */
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

    /**
     * Shows damage popup.
     * @param {number} amount - The amount to apply.
     * @param {MovableObject} enemy - The enemy to check/affect.
     */
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

    /**
     * Shows coin popup.
     * @param {Coin|BigCoin} coin - The coin involved in the collision.
     */
    showCoinPopup(coin){
        this.coinPopups.push({
            x: coin.x + coin.width / 2,
            y: coin.y,
            elapsed: 0,
            duration: 800,
            riseDistance: 75
        });
    },

    /**
     * Checks coin collision.
     */
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

    /**
     * Checks whether the character bumped into any coin that blocks movement
     * (i.e. isn't collected on touch) and chips away at it.
     * @returns {boolean} True if at least one blocking coin was hit.
     */
    checkCoinHit(){
        let hitSomething = false;
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            if (this.hitBlockingCoin(this.level.coins[i], i)) hitSomething = true;
        }
        return hitSomething;
    },

    /**
     * Reduces a blocking coin's value by one, collects it once it hits 0,
     * and updates the coin bar. Used for coins that must be "mined" by
     * standing next to them rather than collected on touch.
     * @param {Coin|BigCoin} coin - The coin involved in the collision.
     * @param {number} index - Index of the coin within level.coins.
     * @returns {boolean} True if the coin was near enough to be hit.
     */
    hitBlockingCoin(coin, index){
        if (coin.collectOnTouch || !this.character.isNear(coin)) return false;
        coin.value--;
        this.collectedCoins++;
        let percentage = (this.collectedCoins / this.totalCoins) * 100;
        this.coinBar.setPercentage(percentage, this.coinBar.IMAGES_COINBAR, this.collectedCoins);
        this.showCoinPopup(coin);
        if (coin.value <= 0) this.level.coins.splice(index, 1);
        AudioHub.stopOne(AudioHub.FIN_SLAP);
        AudioHub.playOne(AudioHub.COIN_COLLECTED);
        return true;
    },

    /**
     * Checks poison collision.
     */
    checkPoisonCollision(){
        for (let i = this.level.poisons.length - 1; i >= 0; i--) {
            let poison = this.level.poisons[i];
            if (poison.collectOnTouch && this.character.isColliding(poison)) {
                this.level.poisons.splice(i, 1);
                this.collectedPoisons += poison.value;
                let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
                this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
                AudioHub.playOne(AudioHub.POTIN_COLLECTED);
            }
        }
    },

    /**
     * Computes where a bubble/poison shot should spawn, based on the
     * character's current position and the direction it's facing.
     * @returns {{x: number, y: number, direction: number}} Spawn position and firing direction (1 = right, -1 = left).
     */
    getShotSpawnPosition(){
        let direction = this.character.otherDirection ? -1 : 1;
        let x = this.character.otherDirection
            ? this.character.x - 20
            : this.character.x + this.character.width - 60;
        return { x, y: this.character.y + 150, direction };
    },

    /**
     * Checks firing objects.
     */
    checkFiringObjects(){
        if (!this.character.justFiredBubble) return;
        this.character.justFiredBubble = false;
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new FiringObject(spawn.x, spawn.y, spawn.direction));
        AudioHub.playOne(AudioHub.BUBBLE_FINISH_LOAD);
    },

    /**
     * Checks poison firing objects.
     */
    checkPoisonFiringObjects(){
        if (!this.character.justFiredPoison) return;
        this.character.justFiredPoison = false;
        this.consumePoisonAmmo();
        let spawn = this.getShotSpawnPosition();
        this.firingObjects.push(new PoisonBubble(spawn.x, spawn.y, spawn.direction));
        AudioHub.playOne(AudioHub.BUBBLE_FINISH_LOAD);
    },

    /**
     * Consumes poison ammo.
     */
    consumePoisonAmmo(){
        this.collectedPoisons--;
        let percentage = (this.collectedPoisons / this.totalPoisons) * 100;
        this.posionBar.setPercentage(percentage, [], this.collectedPoisons);
    },
};