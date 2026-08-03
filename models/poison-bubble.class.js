import { FiringObject } from "./firing-object.class.js";

export class PoisonBubble extends FiringObject {

    constructor (x, y, direction = 1)  {
        super(x, y, direction);
        this.loadImage('./assets/img/1.Sharkie/4.Attack/Bubble_trap/PoisonedBubbleforWhale.png');
    }
}