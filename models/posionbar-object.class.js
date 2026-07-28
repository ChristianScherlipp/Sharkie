import { Statusbar } from "./status-bar.class.js";

export class Posionbar extends Statusbar {
    x = 100;
    y = 30;
    width = 40;
    height = 40;
    iconMode = true;

    IMAGE_POISON_ICON = [
        './assets/img/4.Marcadores/green/100_copia_5.png'
    ];

    constructor (){
        super();

        this.loadImage(this.IMAGE_POISON_ICON);
        this.setPercentage(0, [], 0)
    }
}