import { MovableObject } from "../core/movable-object.class.js";

export class Light extends MovableObject {
    y = 0;
    width = 450;
    height = 450;
    

    /**
     * Creates a new Light instance.
     */
    constructor() {
        super().loadImage('./assets/img/3.Background/Layers/1.Light/1.png');
        this.x = Math.random() * 450;
    }

    /**
     * Updates the object#s state fpr the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime) {
        this.moveLeft(deltaTime);
    }
}