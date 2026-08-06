import { MovableObject } from "./movable-object.class.js";

export class Poison extends MovableObject {
    showFrame = false;
    x;
    y;
    width = 60;
    height = 50;
    offset = {
        top: 5,
        left: 17,
        right: 17,
        bottom: 5
    };
    value = 5;
    collectOnTouch = true;
    blocksMovement = false;
    IMAGE_POISON = './assets/img/4.Marcadores/green/100_copia_5.png';

    constructor (x, y) {
        super();
        this.loadImage(this.IMAGE_POISON);
        this.x = x;
        this.y = y;
        this.getRealFrame();
    }

    update(deltaTime){

    }
}