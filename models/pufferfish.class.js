import { MovableObject } from "./movable-object.class.js";

export class Pufferfish extends MovableObject {
    showFrame = true;
    x = 200 + Math.random() * 2500;
    y = Math.random() * 450;
    width = 140;
    height = 110;

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

    minX;
    maxX;
    movingLeft = true;

    constructor(){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.speed = 0.15 + Math.random() * 0.5;
        this.minX = this.x - (200 + Math.random() * 200);
        this.maxX = this.x + (200 + Math.random() * 200);
        this.getRealFrame();
    }

     // Wird jeden Frame von World.update() aufgerufen.
    update(deltaTime) {
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