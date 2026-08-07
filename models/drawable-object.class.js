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
    
    // loadImage
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
        if (this.showFrame) {
            ctx.beginPath();
            ctx.lineWidth = '5';
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        if (this.showFrame) {
            ctx.beginPath();
            ctx.lineWidth = '1';
            ctx.strokeStyle = "red";
            ctx.rect(this.rX, this.rY, this.rW,  this.rH);
            ctx.stroke();
        }
    }

}


