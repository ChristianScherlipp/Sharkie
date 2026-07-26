import { DrawableObject } from "./drawable-object.class.js";

export class Statusbar extends DrawableObject{
    percentage;
    displayValue;

    constructor() {
        super();
    }

    setPercentage(percentage, images, displayValue = percentage){
        this.percentage = percentage;
        this.displayValue = displayValue;
        let path = images[this.resolveImageIndex()];
        this.img = this.imageCache[path];
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

    // Zeichnet zuerst die Balken-Grafik (wie bisher) und schreibt danach
    // den aktuellen Wert als "60" mittig über den Balken.
    draw(ctx) {
        super.draw(ctx);
        let text = `${Math.round(this.displayValue)}`;
        let textX = this.x + this.width / 2;
        let textY = this.y + this.height / 2;
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.strokeText(text, textX, textY);
        ctx.fillStyle = 'white';
        ctx.fillText(text, textX, textY);
        ctx.restore();
    }
}