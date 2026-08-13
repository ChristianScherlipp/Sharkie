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
    
    constructor(){

    }
    
    loadImage(path){
        this.img = getSharedImage(path);
    }
    /**
     * 
     * @param {Array} arr - ['img/image1', 'img/image2', ...] 
     */
    loadImages(arr) {
        arr.forEach((path) => {
            this.imageCache[path] = getSharedImage(path);
        });
    }
    
    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx){
        if (!this.showFrame) return;
        this.drawDebugRect(ctx, this.x, this.y, this.width, this.height, 'blue', 3);
        this.drawDebugRect(ctx, this.rX, this.rY, this.rW, this.rH, 'red', 1);
    }

    drawDebugRect(ctx, x, y, w, h, color, lineWidth){
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }
}


