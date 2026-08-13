import { DrawableObject } from "./drawable-object.class.js";

export class Statusbar extends DrawableObject{
    percentage;
    displayValue;
    iconMode;

    constructor() {
        super();
    }

    setPercentage(percentage, images, displayValue = percentage){
        this.percentage = percentage;
        this.displayValue = displayValue;
        if (!this.iconMode) {
            let path = images[this.resolveImageIndex()];
            this.img = this.imageCache[path];
        }
    }

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

    draw(ctx) {
        super.draw(ctx);
        this.drawValueText(ctx);
    }

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

    getTextPosition() {
        if (this.iconMode) {
            return { x: this.x + this.width + 18, y: this.y + this.height / 2 };
        }
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}