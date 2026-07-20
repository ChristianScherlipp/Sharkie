import { Statusbar } from "./status-bar.class.js";

export class Coinbar extends Statusbar {
    x = 20;
    y = 30;
    width = 160;
    height = 40;

    IMAGES_COINBAR = [
        './assets/img/4.Marcadores/green/Coin/0_copia4.png',
        './assets/img/4.Marcadores/green/Coin/20_copia4.png',
        './assets/img/4.Marcadores/green/Coin/40_copia4.png',
        './assets/img/4.Marcadores/green/Coin/60_copia4.png',
        './assets/img/4.Marcadores/green/Coin/80_copia4.png',
        './assets/img/4.Marcadores/green/Coin/100_copia4.png',
    ];

    constructor (){
        super();

        this.loadImages(this.IMAGES_COINBAR);
        this.setPercentage(0, this.IMAGES_COINBAR)
    }
}