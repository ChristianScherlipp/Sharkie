class Posionbar extends Statusbar {
    x = 20;
    y = 60;
    width = 160;
    height = 40;

    IMAGES_COINBAR = [
        './assets/img/4.Marcadores/green/poisoned_bubbles/0_copia2.png',
        './assets/img/4.Marcadores/green/poisoned_bubbles/20_copia2.png',
        './assets/img/4.Marcadores/green/poisoned_bubbles/40_copia2.png',
        './assets/img/4.Marcadores/green/poisoned_bubbles/60_copia2.png',
        './assets/img/4.Marcadores/green/poisoned_bubbles/80_copia2.png',
        './assets/img/4.Marcadores/green/poisoned_bubbles/100_copia2.png',
        
    ];

    constructor (){
        super();

        this.loadImages(this.IMAGES_COINBAR);
        this.setPercentage(0, this.IMAGES_COINBAR)
    }
}