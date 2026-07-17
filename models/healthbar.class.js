class Healthbar extends Statusbar {
    x = 20;
    y = 0;
    width = 120;
    height = 30;

    IMAGES_HEALTHBAR = [
        './assets/img/4.Marcadores/green/Life/0_copia3.png',
        './assets/img/4.Marcadores/green/Life/20_copia3.png',
        './assets/img/4.Marcadores/green/Life/40_copia3.png',
        './assets/img/4.Marcadores/green/Life/60_copia3.png',
        './assets/img/4.Marcadores/green/Life/80_copia3.png',
        './assets/img/4.Marcadores/green/Life/100_copia3.png',
    ];

    constructor() {
        super();

        this.loadImages(this.IMAGES_HEALTHBAR);
        this.setPercentage(100, this.IMAGES_HEALTHBAR)
    }
}