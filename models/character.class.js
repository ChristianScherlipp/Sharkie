import { MovableObject } from "./movable-object.class.js";

export class Character extends MovableObject {
    showFrame = true;
    x = 20;
    y = 150;
    width = 250;
    height = 290;
    speed = 4;
    world;
    longIdleThreshold = 8000;
    idleTime = 0;

    offset = {
        top : 130,
        left : 50,
        right : 50,
        bottom : 70
    };
    
    IMAGES_SWIM = [
            './assets/img/1.Sharkie/3.Swim/1.png',
            './assets/img/1.Sharkie/3.Swim/2.png',
            './assets/img/1.Sharkie/3.Swim/3.png',
            './assets/img/1.Sharkie/3.Swim/4.png',
            './assets/img/1.Sharkie/3.Swim/5.png',
            './assets/img/1.Sharkie/3.Swim/6.png',
        ];
    
    IMAGES_DEAD = [
        './assets/img/1.Sharkie/6.dead/1.Poisoned/1.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/2.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/3.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/4.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/5.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/6.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/7.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/8.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/9.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/10.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/11.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/12.png'
    ];

    IMAGES_HURT = [
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/1.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/2.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/3.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/4.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/5.png'
    ];

    IMAGES_IDLE = [
        './assets/img/1.Sharkie/1.IDLE/1.png',
        './assets/img/1.Sharkie/1.IDLE/2.png',
        './assets/img/1.Sharkie/1.IDLE/3.png',
        './assets/img/1.Sharkie/1.IDLE/4.png',
        './assets/img/1.Sharkie/1.IDLE/5.png',
        './assets/img/1.Sharkie/1.IDLE/6.png',
        './assets/img/1.Sharkie/1.IDLE/7.png',
        './assets/img/1.Sharkie/1.IDLE/8.png',
        './assets/img/1.Sharkie/1.IDLE/9.png',
        './assets/img/1.Sharkie/1.IDLE/10.png',
        './assets/img/1.Sharkie/1.IDLE/11.png',
        './assets/img/1.Sharkie/1.IDLE/12.png',
        './assets/img/1.Sharkie/1.IDLE/13.png',
        './assets/img/1.Sharkie/1.IDLE/14.png',
        './assets/img/1.Sharkie/1.IDLE/15.png',
        './assets/img/1.Sharkie/1.IDLE/16.png',
        './assets/img/1.Sharkie/1.IDLE/17.png',
        './assets/img/1.Sharkie/1.IDLE/18.png'
    ];

    IMAGES_LONG_IDLE = [
        './assets/img/1.Sharkie/2.Long_IDLE/I1.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I2.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I3.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I4.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I5.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I6.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I7.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I8.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I9.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I10.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I11.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I12.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I13.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I14.png'
    ];

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.getRealFrame();
    }

    

    update(deltaTime) {
        let factor = deltaTime / (1000 / 60);
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
            this.x += this.speed * factor;
            this.otherDirection = false;
        } 
        if (this.world.keyboard.LEFT && this.x > this.world.level.level_start_x) {
            this.x -= this.speed * factor;
            this.otherDirection = true;
        }
        if (this.world.keyboard.UP && this.y > -130) {
            this.y -= this.speed * factor;
            this.acceleration = 0;
        }
        if (this.world.keyboard.DOWN && this.isAboveGround()) {
            this.y += this.speed * factor;
        }
        // Kamera mit Totzone: bleibt stehen, solange der Hintergrund sonst eine
        // schwarze Lücke zeigen würde (Weltanfang/-ende), folgt Sharkie sonst
        // ab 40% der Canvas-Breite.
        let canvasWidth = this.world.canvas.width;
        let followX = this.world.level.level_start_x + canvasWidth * 0.3;
        let cameraMax = -this.world.level.level_start_x;
        let cameraMin = canvasWidth - this.world.level.level_end_x;
        let desiredCamera = followX - this.x;
        this.world.camera_x = Math.min(cameraMax, Math.max(cameraMin, desiredCamera));

        this.getRealFrame();
        
        let isMoving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT || this.world.keyboard.UP || this.world.keyboard.DOWN;
        if (isMoving) {
            this.idleTime = 0;
        } else {
            this.idleTime += deltaTime;
        }
        
        this.animationTimer += deltaTime;
        if(this.animationTimer > 150){
            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (isMoving) {
                this.playAnimation(this.IMAGES_SWIM);
            }else if (this.idleTime > this.longIdleThreshold) {
                this.playAnimation(this.IMAGES_LONG_IDLE);
                this.applyGravity(deltaTime);
            } else {
                this.playAnimation(this.IMAGES_IDLE);
            }
            this.animationTimer = 0;
        }
    }
}