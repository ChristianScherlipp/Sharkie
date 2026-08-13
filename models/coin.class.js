import { MovableObject } from "./movable-object.class.js";

export class Coin extends MovableObject {
    showFrame = false;
    x;
    y;
    width = 30;
    height = 30;

    offset = {
        top : 5,
        left : 5,
        right : 5,
        bottom : 5
    };
    value = 1;
    collectOnTouch = true;
    blocksMovement = false;

    IMAGES_COIN = [
        './assets/img/4.Marcadores/1.Coins/1.png',
        './assets/img/4.Marcadores/1.Coins/2.png',
        './assets/img/4.Marcadores/1.Coins/3.png',
        './assets/img/4.Marcadores/1.Coins/4.png',
    ];

    /**
     * Creates a new Coin instance.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} [value=1] - The value to apply.
     */
    constructor(x, y, value = 1) {
        super();
        this.loadImage(this.IMAGES_COIN[0]);
        this.loadImages(this.IMAGES_COIN);
        this.x = x;
        this.y = y
        this.value = value;
        this.getRealFrame();
    }

    /**
     * Updates the object's state for the current frame.
     * @param {number} deltaTime - Time elapsed since the last frame, in milliseconds.
     */
    update(deltaTime){
        this.animateImages(this.IMAGES_COIN, deltaTime, 255)
    }
}