import { getSharedImage } from "./image-cache.js";

export class DrawableObject {
    x;
    y;
    height= 120;
    width = 150;
    img;
    imageCache = {};
    currentImage = 0;
    showFrame = false;
    
    /**
     * Creates a new DrawableObject instance.
     */
    constructor(){

    }

    /**
     * Loads image.
     * @param {string} path - Path to the image file.
     */
    loadImage(path){
        this.img = getSharedImage(path);
    }

    /**
     * Loads images.
     * @param {Array<string>} arr - List of image paths to preload.
     */
    loadImages(arr) {
        arr.forEach((path) => {
            this.imageCache[path] = getSharedImage(path);
        });
    }
    
    /**
     * Draws the object onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw with.
     */
    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws frame.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw with.
     */
    drawFrame(ctx){
        if (!this.showFrame) return;
        this.drawDebugRect(ctx, this.x, this.y, this.width, this.height, 'blue', 3);
        this.drawDebugRect(ctx, this.rX, this.rY, this.rW, this.rH, 'red', 1);
    }

    /**
     * Draws debug rect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw with.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     * @param {number} w - Width in pixels.
     * @param {number} h - Height in pixels.
     * @param {string} color - CSS color used to draw the text.
     * @param {number} lineWidth - Width of the drawn line, in pixels.
     */
    drawDebugRect(ctx, x, y, w, h, color, lineWidth){
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }
}
