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

    /**
     * Creates a new FiringObject instance
     * @param {number} x - X position in pixels.
     * @param {number} y  - Y position in pixels.
     * @param {number} direction - Movement direction (1 = right, -1 = left).
     */
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

    /**
     * Update the object's state for the current frame.
     * @param {number} deltaTime  - Time elapsed since the last frame, in millisecond.
     */
    update(deltaTime) {
        this.age += deltaTime;
        if (!this.antiGravityActive) {
            this.updateBriskMovement(deltaTime);
        } else {
            this.updateDriftAndDecay(deltaTime);
        }
    }

    /**
     * Update brisk movement.
     * @param {number} deltaTime - Time elapsed since the last frame, in millisecond.
     */
    updateBriskMovement(deltaTime) {
        let step = this.briskSpeed * (deltaTime / 50);
        this.x += step * this.direction;
        this.distanceTraveled += step;
        if (this.distanceTraveled >= this.briskDistance) {
            this.antiGravityActive = true;
            this.antiGravityTimer = 0;
        }
    }

    /**
     * Update drift and decay.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    updateDriftAndDecay(deltaTime) {
        this.applyAntiGravity(deltaTime);
        this.x += 3 * (deltaTime / 50) * this.direction;
        this.antiGravityTimer += deltaTime;
        let decayProgess = Math.min(this.antiGravityTimer / this.damageDecayDuration, 1);
        this.currentDamage = Math.max(0, this.baseDamage * (1 - decayProgess));
    }
}