class MovableObject extends DrawableObject {
    speed = 0.15;
    speedY = 0;
    acceleration = 0.0004;
    
    otherDirection = false;
    energy = 100;
    lastHit = 0;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 0,
        left : 0,
        right : 0,
        bottom : 0
    };

    constructor() {
        super();
    }

    getRealFrame(){
            this.rX = this.x + this.offset.left;
            this.rY = this.y + this.offset.top;
            this.rW = this.width - this.offset.left - this.offset.right;
            this.rH = this.height - this.offset.top - this.offset.bottom;
    }

    moveRight(){
        setInterval(() => {
            this.x += this.speed;  
            this.getRealFrame();
        }, 1000 / 120);
    }

    moveLeft(){
        setInterval(() => {
        this.x -= this.speed;
        this.getRealFrame();
        }, 1000 / 120);
    }

    moveUp(){
        setInterval(() => {
        this.y -= this.speed;
        this.getRealFrame();
        }, 1000 / 120);
    }

    moveDown(){
        setInterval(() => {
        this.y += this.speed;
        this.getRealFrame();
        }, 1000 / 120);
    }

    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    applyGravity(){
        setInterval(() => {
                if (this.isAboveGround()) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration; 
                this.getRealFrame();
            }
        }, 1000 / 120)
    }

    applyAntiGravity(){
        setInterval(() => {
                this.y -= this.speedY;
                this.speedY += this.acceleration; 
                this.getRealFrame();
        }, 1000 / 120)
    }

    isAboveGround(){
        return this.y < 240;
    }

    isColliding(mo){
        return this.rX + this.rW > mo.rX &&
            this.rY + this.rH > mo.rY &&
            this.rX < mo.rX + mo.rW &&
            this.rY < mo.rY + mo.rH;
    }

    hit(){
        this.energy -= 2;
        if(this.energy < 0){
            this.energy = 0;
        }else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit; //Difference in ms
        timepassed = timepassed / 1000; // Difference in s
        return timepassed < 1;
    }

    isDead() {
        return this.energy == 0;
    }
}