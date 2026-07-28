import { Statusbar } from "./status-bar.class.js";

export class Coinbar extends Statusbar {
    x = 20;
    y = 30;
    width = 40;
    height = 40;
    iconMode = true;

    IMAGE_COIN_ICON = [
        './assets/img/4.Marcadores/green/100_copia_6.png'
    ];

    constructor (){
        super();

        this.loadImage(this.IMAGE_COIN_ICON);
        this.setPercentage(0, [], 0)
    }
}