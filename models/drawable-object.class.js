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
        this.img = new Image(); // this.Image = document.getElementById('Image') <img id="image" src>
        this.img.src = path;
    }
    
    /**
     * 
     * @param {Array} arr - ['img/image1', 'img/image2', ...] 
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
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


