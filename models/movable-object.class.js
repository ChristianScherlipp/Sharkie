class MovableObject extends DrawableObject {
    speed = 0.15;
    speedY = 0;
    acceleration = 0.0004;
    
    otherDirection = false;
    energy = 100;
    lastHit = 0;

    constructor() {
        super();
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
            }
        }, 1000 / 120)
    }

    isAboveGround(){
        return this.y < 240;
    }

    drawFrame(ctx){
        if (this instanceof Character || this instanceof Finalboss || this instanceof Jellyfish || this instanceof Pufferfish) {
            ctx.beginPath();
            ctx.lineWidth = '5';
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        if (this instanceof Character || this instanceof Finalboss || this instanceof Jellyfish || this instanceof Pufferfish) {
            ctx.beginPath();
            ctx.lineWidth = '1';
            ctx.strokeStyle = "red";
            ctx.rect(this.x + this.offset.left , this.y + this.offset.top, this.width - this.offset.right - this.offset.left,  this.height - this.offset.bottom - this.offset.top);
            ctx.stroke();
        }
    }

    isColliding(mo){        
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
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