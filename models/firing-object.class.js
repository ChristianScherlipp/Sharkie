import { MovableObject } from "./movable-object.class.js";

export class FiringObject extends MovableObject {
    direction = 1; // 1 = rechts, -1 = links

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


    // Wird jeden Frame von World.update() aufgerufen (ersetzt applyAintiGravity()-
    //  Interval und das seoerate x += 3-Interval)
    update(deltaTime) {
        this.applyAntiGravity(deltaTime);
        this.x += 3 * (deltaTime / 50) * this.direction;
    } 
}