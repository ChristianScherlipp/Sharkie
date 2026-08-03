import { MovableObject } from "./movable-object.class.js";

export class Poison extends MovableObject {
    showFrame = true;
    x;
    y;
    width = 40;
    height = 40;
    offset = {
        top: 5,
        left: 5,
        right: 5,
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