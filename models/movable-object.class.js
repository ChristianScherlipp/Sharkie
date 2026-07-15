class MovableObject {
    x;
    y;
    img;
    height= 120;
    width = 150;
    speed = 0.15;
    speedY = 0;
    acceleration = 0.0004;
    imageCache = {};
    currentImage = 0;
    otherDirection = false;

    constructor() {

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

    moveRight(){
        setInterval(() => {
            this.x += this.speed;    
        }, 1000 / 120);
    }

    moveLeft(){
        setInterval(() => {
        this.x -= this.speed;
        }, 1000 / 120);
    }

    moveUp(){
        setInterval(() => {
        this.y -= this.speed;
        }, 1000 / 120);
    }

    moveDown(){
        setInterval(() => {
        this.y += this.speed;
        }, 1000 / 120);
    }

    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    apllyGravity(){
        setInterval(() => {
                if (this.isAboveGround()) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration; 
                console.log('y is ' + this.y);
            }
        }, 1000 / 120)
    }

    isAboveGround(){
        return this.y < 240;
    }
}