import { Finalboss } from "./finalboss.class.js";
import { Jellyfish } from "./jellyfish.class.js";
import { PoisonBubble } from "./poison-bubble.class.js";
import { AudioHub } from "./audio-hub.class.js";

// Kampf-Methoden für World, ausgelagert damit world.class.js unter der
// 400-LOC-Grenze bleibt. Wird per Object.assign(World.prototype, ...) in
// world.class.js eingebunden - die Methoden greifen weiterhin ganz normal
// über "this" auf die World-Instanz zu.
export const WorldCombatMixin = {

    checkCollision(){
        this.level.enemies.forEach((enemy) =>{
                if (enemy.isDying) return;
                if (enemy instanceof Finalboss && !enemy.introduced) return;
                if(this.character.isColliding(enemy)) {
                    this.applyEnemyContact(enemy);
                }
            })
    },

    // Direkter Körperkontakt mit einem Gegner: Schaden anwenden, bei einer
    // Qualle zusätzlich den Elektroschock-Sound abspielen, und ggf. zurückstoßen.
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
    },

    // Fin Slap trifft nur Pufferfish/Finalboss, und nur wenn Sharkie nah genug ist.
    canFinSlapReach(enemy){
        if (enemy.isDying) return false;
        let isPufferfish = enemy.constructor.name === 'Pufferfish';
        let isFinalboss = enemy instanceof Finalboss;
        if (!isPufferfish && !isFinalboss) return false;
        if (isFinalboss && !enemy.introduced) return false;
        return this.character.isNear(enemy);
    },

    // Blickrichtung des Gegners: false = links, true = rechts (gleiche
    // Konvention wie bei der Erkennung). true = Sharkie steht vor ihm.
    isEnemyFacingCharacter(enemy){
        let facingLeft = !enemy.otherDirection;
        let charCenterX = this.character.x + this.character.width / 2;
        let enemyCenterX = enemy.x + enemy.width / 2;
        return facingLeft ? charCenterX <= enemyCenterX : charCenterX >= enemyCenterX;
    },

    // Von vorne: Gegner hat die Stacheln oben, Sharkie bekommt selbst Schaden.
    punishFrontalFinSlap(enemy){
        this.character.hit(enemy.damage);
        this.character.lastHitByJellyfish = false;
        this.healthBar.setPercentage(this.character.energy, this.healthBar.IMAGES_HEALTHBAR);
    },

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
    },

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
    },

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
    },

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
    },

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
};