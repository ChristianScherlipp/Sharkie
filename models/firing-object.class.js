import { MovableObject } from "./movable-object.class.js";

export class FiringObject extends MovableObject {
    direction = 1;
    baseDamage = 1;
    currentDamage = 1;
    distanceTraveled = 0;
    briskDistance = 100;
    briskSpeed = 6;
    antiGravityActive = false;
    antiGravityTimer = 0;
    damageDecayDuration = 1000;

    age = 0;

    constructor(x, y, direction = 1) {
        super().loadImage('./assets/img/1.Sharkie/4.Attack/Bubble_trap/Bubble.png');
        this.x = x;
        this.y = y;
        this.height = 50;
        this.width = 50;
        this.stpeedY = 30;
        this.direction = direction;
        this.otherDirection = direction === -1;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (!this.antiGravityActive) {
            this.updateBriskMovement(deltaTime);
        } else {
            this.updateDriftAndDecay(deltaTime);
        }
    }

    updateBriskMovement(deltaTime) {
        let step = this.briskSpeed * (deltaTime / 50);
        this.x += step * this.direction;
        this.distanceTraveled += step;
        if (this.distanceTraveled >= this.briskDistance) {
            this.antiGravityActive = true;
            this.antiGravityTimer = 0;
        }
    }

    updateDriftAndDecay(deltaTime) {
        this.applyAntiGravity(deltaTime);
        this.x += 3 * (deltaTime / 50) * this.direction;
        this.antiGravityTimer += deltaTime;
        let decayProgess = Math.min(this.antiGravityTimer / this.damageDecayDuration, 1);
        this.currentDamage = Math.max(0, this.baseDamage * (1 - decayProgess));
    }
}