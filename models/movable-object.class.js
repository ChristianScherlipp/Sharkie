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

    // Zähler für Sprite-Animationen, wird von animateImages() genutzt
    animationTimer = 0;

    constructor() {
        super();
    }

    getRealFrame(){
            this.rX = this.x + this.offset.left;
            this.rY = this.y + this.offset.top;
            this.rW = this.width - this.offset.left - this.offset.right;
            this.rH = this.height - this.offset.top - this.offset.bottom;
    }

    // Referenz-Tick war früher 1000/120 ms -> alle Werte bleiben wie voher kalibriert,
    // "factor" gleicht unterschiedliche Bildwiederholraten aus 
    moveRight(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x += this.speed * factor;  
        this.getRealFrame();
    }

    moveLeft(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.x -= this.speed *factor;
        this.getRealFrame();
    }

    moveUp(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speed * factor;
        this.getRealFrame();
    }

    moveDown(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y += this.speed * factor;
        this.getRealFrame();
    }

    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    //Ersetzt die früheren einzelnen setINterval-Animationsschleifen.
    // interval = wie viele ms zwischen zwei Bildwechseln liegen soll (z.B. 150)
    animateImages(images, deltaTime, interval){
        this.animationTimer += deltaTime;
        if (this.animationTimer > interval) {
            this.playAnimation(images);
            this.animationTimer = 0;
        }
    }

    applyGravity(deltaTime){
        if (this.isAboveGround()) {
            let factor = deltaTime / (1000 / 120);
            this.y -= this.speedY * factor;
            this.speedY -= this.acceleration * factor; 
            this.getRealFrame();
        }
    }

    applyAntiGravity(deltaTime){
        let factor = deltaTime / (1000 / 120);
        this.y -= this.speedY * factor;
        this.speedY += this.acceleration * factor; 
        this.getRealFrame();
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

    //  Wird von der zentralen Game-Loop in World jeden Frame aufgerufen.
    // Unterklassen überschreiben das mit ihrer eigenen Bewegungs- / Animationslogik
    update(deltaTime){
        // absichtlich leer(default no+op)
    }
}