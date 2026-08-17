import { DrawableObject } from "../core/drawable-object.class.js";

export class Statusbar extends DrawableObject{
    percentage;
    displayValue;
    iconMode;

    /**
     * Creates a new Statusbar instance
     */
    constructor() {
        super();
    }

    /**
     * Sets percentage.
     * @param {number} percentage - Percentage value frome 0 to 100.
     * @param {Array<HTMLImageElement|string>} images - Ordered list of animation frame images.
     * @param {number} displayValue - The value to display as text.
     */
    setPercentage(percentage, images, displayValue = percentage){
        this.percentage = percentage;
        this.displayValue = displayValue;
        if (!this.iconMode) {
            let path = images[this.resolveImageIndex()];
            this.img = this.imageCache[path];
        }
    }

    /**
     * Resolve image index.
     * @returns {number} - The computedt reesult.
     */
    resolveImageIndex(){
            if (this.percentage == 100) {
                return 5;
            }else if (this.percentage >= 80) {
                return 4;
            }else if (this.percentage >= 60) {
                return 3;
            }else if (this.percentage >= 40) {
                return 2;
            }else if (this.percentage >= 20) {
                return 1;
            }else {
                return 0;
            }
    }

    /**
     * Draws the object onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw with.
     */
    draw(ctx) {
        super.draw(ctx);
        this.drawValueText(ctx);
    }

    /**
     * Draws value text.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw with.
     */
    drawValueText(ctx) {
        let text = `${Math.round(this.displayValue)}`;
        let pos = this.getTextPosition();
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.textAlign = this.iconMode ? 'left' : 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(text, pos.x, pos.y);
        ctx.fillText(text, pos.x, pos.y);
        ctx.restore();
    }

    /**
     * Gets text posiotion.
     * @returns {number} - The request value.
     */
    getTextPosition() {
        if (this.iconMode) {
            return { x: this.x + this.width + 18, y: this.y + this.height / 2 };
        }
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}