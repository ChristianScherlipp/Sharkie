import { Finalboss } from "./finalboss.class.js";
import { Jellyfish } from "./jellyfish.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { AudioHub } from "./audio-hub.class.js";
import { MovableObject } from "./movable-object.class.js";

export const WorldCombatMixin = {

    /**
     * Checks collision.
     */
    checkCollision(){
        this.level.enemies.forEach((enemy) =>{
                if (enemy.isDying) return;
                if (enemy instanceof Finalboss && !enemy.introduced) return;
                if(this.character.isColliding(enemy)) {
                    this.applyEnemyContact(enemy);
                }
            })
    },

    /**
     * Applies enemy contact.
     * @param {MovableObject} enemy - The enemy to check/affect.
     */
    applyEnemyContact(enemy){
        this.character.hit(enemy.damage);
        this.character.lastHitByJellyfish = enemy instanceof Jellyfish;
        this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR)
        if (enemy instanceof Jellyfish) {
            AudioHub.playOne(AudioHub.JELLYFISH_CONTACT);
        }
        if (enemy.knocksBack) {
            this.applyKnockback(enemy);
        }
    },

    /**
     * Checks every enemy within fin-slap range and applies damage or a
     * frontal-hit punishment, depending on which way the enemy is facing.
     * @returns {boolean} True if at least one enemy was successfully hit.
     */
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
    },

    canFinSlapReach(enemy){
        if (enemy.isDying) return false;
        let isPufferfish = enemy.constructor.name === 'Pufferfish';
        let isFinalboss = enemy instanceof Finalboss;
        if (!isPufferfish && !isFinalboss) return false;
        if (isFinalboss && !enemy.introduced) return false;
        return this.character.isNear(enemy);
    },

    /**
     * Checks whether the character is close enough and the enemy is a valid
     * fin-slap target (Pufferfish or an already-introduced Finalboss).
     * @param {MovableObject} enemy - The enemy to check/affect.
     * @returns {boolean} True if the enemy is in fin-slap range.
     */
    isEnemyFacingCharacter(enemy){
        let facingLeft = !enemy.otherDirection;
        let charCenterX = this.character.x + this.character.width / 2;
        let enemyCenterX = enemy.x + enemy.width / 2;
        return facingLeft ? charCenterX <= enemyCenterX : charCenterX >= enemyCenterX;
    },

    /**
     * Punishes frontal fin slap.
     * @param {MovableObject} enemy - The enemy to check/affect.
     */
    punishFrontalFinSlap(enemy){
        this.character.hit(enemy.damage);
        this.character.lastHitByJellyfish = false;
        this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR);
    },

    /**
     * Applies fin-slap damage to an enemy (or boss damage for the Finalboss)
     * and starts its death animation once its health drops to 0.
     * @param {MovableObject} enemy - The enemy to check/affect.
     * @returns {boolean} True; always considered a successful hit once reached.
     */
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
    },

    /**
     * Checks bubble hit on enemies.
     */
    checkBubbleHitOnEnemies(){
        for (let i = this.firingObjects.length - 1; i >= 0; i--) {
            let bubble = this.firingObjects[i];
            if (bubble instanceof PoisonBubble) continue;
            this.checkBubbleAgainstEnemies(bubble, i);
        }
    },

    /**
     * Checks bubble against enemies.
     * @param {FiringObject} bubble - The fired bubble/poison-bubble object.
     * @param {number} bubbleIndex - Index of the bubble within the firing objects array.
     */
    checkBubbleAgainstEnemies(bubble, bubbleIndex){
        for (let j = this.level.enemies.length - 1; j >= 0; j--) {
            let enemy = this.level.enemies[j];
            if (enemy.isDying) continue;
            if (enemy instanceof Finalboss && !enemy.introduced) continue;
            if (bubble.isColliding(enemy)) {
                this.firingObjects.splice(bubbleIndex, 1);
                AudioHub.playOne(AudioHub.BUBBLE_BURST);
                this.applyBubbleDamage(enemy, Math.round(bubble.currentDamage));
                break;
            }
        }
    },

    
    /**
     * Applies bubble damage to an enemy (or boss damage for the Finalboss)
     * and starts its death animation once its health drops to 0.
     * @param {MovableObject} enemy - The enemy to check/affect.
     * @param {number} dmg - Amount of damage to apply.
     */
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
    },

    /**
     * Checks poison bubble hit on enemies.
     */
    checkPoisonBubbleHitOnEnemies(){
        for (let i = this.firingObjects.length - 1; i >= 0; i--) {
            let bubble = this.firingObjects[i];
            if (!(bubble instanceof PoisonBubble)) continue;
            this.checkPoisonBubbleAgainstBoss(bubble, i);
        }
    },

    /**
     * Checks poison bubble against boss.
     * @param {FiringObject} bubble - The fired bubble/poison-bubble object.
     * @param {number} bubbleIndex - Index of the bubble within the firing objects array.
     */
    checkPoisonBubbleAgainstBoss(bubble, bubbleIndex){
        for (let j = this.level.enemies.length - 1; j >= 0; j--) {
            let enemy = this.level.enemies[j];
            if (!(enemy instanceof Finalboss)) continue;
            if (enemy.isDying || !enemy.introduced) continue;
            if (bubble.isColliding(enemy)) {
                let dmg = Math.round(bubble.currentDamage);
                this.firingObjects.splice(bubbleIndex, 1);
                AudioHub.playOne(AudioHub.BUBBLE_BURST);
                if (dmg > 0) enemy.takeDamage(dmg);
                enemy.registerPoisonHit();
                break;
            }
        }
    },

    /**
     * Applies knockback.
     * @param {MovableObject} enemy - The enemy to check/affect.
     */
    applyKnockback(enemy){
        let target = this.getKnockbackTarget(enemy);
        this.character.knockbackActive = true;
        this.character.knockbackStartX = this.character.x;
        this.character.knockbackStartY = this.character.y;
        this.character.knockbackTargetX = target.x;
        this.character.knockbackTargetY = target.y;
        this.character.knockbackElapsed = 0;
    },

    /**
     * Computes the position to knock the character back to, pushed away from
     * the enemy along whichever axis (X or Y) overlaps least, clamped to the level bounds.
     * @param {MovableObject} enemy - The enemy causing the knockback.
     * @returns {{x: number, y: number}} Target position for the knockback movement.
     */
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
};