import { MovableObject } from "./movable-object.class.js";

export class Jellyfish extends MovableObject {
    showFrame = true;
    x = 190 + Math.random() * 2500;
    y = Math.random() * (480 - 180);
    width = 70;
    height = 120;
    damage = 2;
    detectionRange = 100;
    exitRange = 130;
    isAlerted = false;
    knocksBack = true;
    knockbackDistance = 100;

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

    JELLY_IMAGES_DANGEROUS = [
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink1.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink2.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink3.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink4.png',
    ];

    minY;
    maxY;
    movingUp = true;

    constructor(x, y) {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.loadImages(this.JELLY_IMAGES_DANGEROUS);
        this.speed = 0.15 +Math.random() * 0.5;
        this.x = x;
        this.y =y;
        let canvasHeight = 480;
        let range = 50 + Math.random() * 5
        this.minY = Math.max(0, this.y - range);
        this.maxY = Math.min(canvasHeight - this.height, this.y + range);
        this.getRealFrame();
    }

    // Wird jeden Frame von World.update() aufgerufen
    update(deltaTime, character){
        let distance = Infinity;
        if (character) {
            let charLeft = character.rX;
            let charRight = character.rX + character.rW;
            let charTop = character.rY;
            let charBottom = character.rY + character.rH;
            let jellyLeft = this.rX;
            let jellyRight = this.rX + this.rW;
            let jellyTop = this.rY;
            let jellyBottom = this.rY + this.rH;
            let dx = Math.max(charLeft - jellyRight, jellyLeft - charRight, 0);
            let dy = Math.max(charTop - jellyBottom, jellyTop - charBottom, 0);
            distance = Math.sqrt(dx * dx + dy * dy);
        }

        let characterBelow = character && (character.y + character.height / 2) > (this.y + this.height / 2);
        let visible = !characterBelow;

        if (!this.isAlerted && distance <= this.detectionRange && visible) {
            this.isAlerted = true;
        } else if (this.isAlerted && distance > this.exitRange) {
            this.isAlerted = false;
        }
        this.damage = this.isAlerted ? 5 : 2;

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
        if (this.isAlerted) {
            this.animateImages(this.JELLY_IMAGES_DANGEROUS, deltaTime, 200);
        } else {
            this.animateImages(this.JELLY_IMAGES_SWIM, deltaTime, 255);
        }
    }
}