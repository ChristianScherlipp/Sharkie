import { MovableObject } from "../core/movable-object.class.js";

export class Poison extends MovableObject {
    showFrame = false;
    x;
    y;
    width = 60;
    height = 50;
    offset = {
        top: 5,
        left: 17,
        right: 17,
        bottom: 5
    };
    value = 5;
    collectOnTouch = true;
    blocksMovement = false;
    IMAGE_POISON = './assets/img/4.Marcadores/green/100_copia_5.png';

    /**
     * Creates a new Poison instance.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     */
    constructor (x, y) {
        super();
        this.loadImage(this.IMAGE_POISON);
        this.x = x;
        this.y = y;
        this.getRealFrame();
    }

    /**
     * Updates the object#s state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime){

    }
}