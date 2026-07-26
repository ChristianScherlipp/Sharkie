import { Coin } from "./coin.class.js";

export class BigCoin extends Coin {
    width = 55;
    height = 55;
    
    constructor(x, y) {
        let value = 5 + Math.floor(Math.random() * 6); // 5 bis 10 (inklusive)
        super(x, y, value);
        this.getRealFrame();
    }
}