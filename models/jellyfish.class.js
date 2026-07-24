import { MovableObject } from "./movable-object.class.js";

export class Jellyfish extends MovableObject {
    showFrame = true;
    x = 190 + Math.random() * 2500;
    y = Math.random() * 400;
    width = 120;
    height = 180;

    offset = {
        top : 25,
        left : 25,
        right : 25,
        bottom : 40
    };
    
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila4.png',
    ];

    minY;
    maxY;
    movingUp = true;

    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.speed = 0.15 +Math.random() * 0.5;
        this.minY = this.y - (50 + Math.random() * 5);
        this.maxY = this.y + (50 + Math.random() * 5);
        this.getRealFrame();
    }

    // Wird jeden Frame von World.update() aufgerufen
    update(deltaTime){
        if (this.movingUp) {
            this.moveUp(deltaTime);
            if (this.y <= this.minY) {
                this.movingUp = false;
            }
        } else {
            this.moveDown(deltaTime);
            if (this.y >= this.maxY) {
                this.movingUp = true;
            }
        }
        this.animateImages(this.JELLY_IMAGES_SWIM, deltaTime, 255)
    }
}