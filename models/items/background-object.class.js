import { MovableObject } from "../core/movable-object.class.js";

export class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;

    /**
     * Creates a new BackgroundObject instance.
     * @param {string} imagePath - Path to the image file.
     * @param {number} x - X position in pixels.
     */
    constructor (imagePath, x) {
        super().loadImage(imagePath)
        this.x = x;
        this.y = 480 - this.height;
    }
}