import { MovableObject } from "./movable-object.class.js";

export class Pufferfish extends MovableObject {
    showFrame = true;
    x = 200 + Math.random() * 2500;
    y = Math.random() * 450;
    width = 140;
    height = 110;
    health = 2;
    damage = 2;
    detectionRange = 100;
    exitRange = 130;  // Hysterese gegen Flackern an der Grenze
    alertState = 'idle';  // 'idle' | 'entering' | 'charging' | 'exiting'
    transitionFrame = 0;
    transitionTimer = 0;
    transitionFrameDuration = 100;
    chargeDeadzone = 20;
    chargeDirectionLeft = true;
    knocksBack = true;
    knockbackDistance = 50;

    minX;
    maxX;
    movingLeft = true;

    offset = {
        top : 5,
        left : 5,
        right : 12,
        bottom : 30
    };
    
    PUFFERFISH_IMAGES_SWIM = [
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim2.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim3.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim4.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim5.png',
    ];

    PUFFERFISH_IMAGES_TRANSITION = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition3.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition4.png',
    ];

    PUFFERFISH_IMAGES_BUBBLESWIM = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim3.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim4.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim5.png',
    ];

    PUFFERFISH_IMAGES_DIE = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.3.png',
    ];


    constructor(x, y){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_TRANSITION);
        this.loadImages(this.PUFFERFISH_IMAGES_BUBBLESWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_DIE);
        this.speed = 0.15 + Math.random() * 0.5;
        this.x = x;
        this.y = y;
        this.minX = this.x - (200 + Math.random() * 200);
        this.maxX = this.x + (200 + Math.random() * 200);
        this.getRealFrame();
    }

     // Wird jeden Frame von World.update() aufgerufen.
    update(deltaTime, character) {
        let distance = Infinity;

        if (this.isDying) {
            this.updateDying(deltaTime, this.PUFFERFISH_IMAGES_DIE);
            return;
        }

        if (character) {
            let charLeft = character.rX;
            let charRight = character.rX + character.rW;
            let charTop = character.rY;
            let charBottom = character.rY + character.rH;
            let fishLeft = this.rX;
            let fishRight = this.rX + this.rW;
            let fishTop = this.rY;
            let fishBottom = this.rY + this.rH;
            let dx = Math.max(charLeft - fishRight, fishLeft - charRight, 0);
            let dy = Math.max(charTop - fishBottom, fishTop - charBottom, 0);
            distance = Math.sqrt(dx * dx + dy * dy);
        }

        if (this.alertState === 'idle' && distance <= this.detectionRange && character) {
            let facingLeft = !this.otherDirection;
            let characterInFront = facingLeft ? (character.x + character.width / 2) <= (this.x + this.width / 2) : (character.x + character.width / 2) >= (this.x + this.width / 2);
            if (characterInFront) {
                this.alertState = 'entering';
                this.transitionFrame = 0;
                this.transitionTimer = 0;
            }
        }
        
        if ((this.alertState === 'entering' || this.alertState === 'charging') && distance > this.exitRange) {
            this.alertState = 'exiting';
        }

        this.damage = (this.alertState === 'idle') ? 2 : 4;

        if (this.alertState === 'entering') {
            this.transitionTimer += deltaTime;
            if (this.transitionTimer > this.transitionFrameDuration) {
                this.transitionTimer = 0;
                this.transitionFrame++;
                if (this.transitionFrame >= this.PUFFERFISH_IMAGES_TRANSITION.length) {
                    this.alertState = 'charging';
                    this.transitionFrame = 0;
                }
            }
            if (this.alertState === 'entering') {
                this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
            }
            return;
        }

        if (this.alertState === 'charging') {
            if (character) {
                let dx = (character.x + character.width / 2) - (this.x + this.width / 2);
                if (Math.abs(dx) > this.chargeDeadzone) {
                    this.chargeDirectionLeft = dx < 0;
                }
            }
            if (this.chargeDirectionLeft) {
                this.moveLeft(deltaTime);
                this.otherDirection = false;
            } else {
                this.moveRight(deltaTime);
                this.otherDirection = true;
            }
            this.animateImages(this.PUFFERFISH_IMAGES_BUBBLESWIM, deltaTime, 150);
            return;
        }

        if (this.alertState === 'exiting') {
            this.transitionTimer += deltaTime;
            if (this.transitionTimer > this.transitionFrameDuration) {
                this.transitionTimer = 0;
                this.transitionFrame--;
                if (this.transitionFrame < 0) {
                    this.alertState = 'idle';
                    this.transitionFrame = 0;
                    this.otherDirection = !this.movingLeft;
                }
            }
            if (this.alertState === 'exiting') {
                this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
            }
            return;
        }

        if (this.movingLeft) {
            this.moveLeft(deltaTime);
            if (this.x <= this.minX) {
                this.movingLeft = false;
                this.otherDirection = true;
            }
        } else {
            this.moveRight(deltaTime);
            if (this.x >= this.maxX) {
                this.movingLeft = true;
                this.otherDirection = false;
            }
        }
        this.animateImages(this.PUFFERFISH_IMAGES_SWIM, deltaTime, 150);
    }
}