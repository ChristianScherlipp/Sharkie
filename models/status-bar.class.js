class Statusbar extends DrawableObject{

    IMAGES_COINBAR = [
        './assets/img/4.Marcadores/green/Coin/0_copia4.png',
        './assets/img/4.Marcadores/green/Coin/20_copia4.png',
        './assets/img/4.Marcadores/green/Coin/40_copia4.png',
        './assets/img/4.Marcadores/green/Coin/60_copia4.png',
        './assets/img/4.Marcadores/green/Coin/80_copia4.png',
        './assets/img/4.Marcadores/green/Coin/100_copia4.png',
    ];

    percentage = 100;

    constructor() {
        super();
        this.loadImages(this.IMAGES_COINBAR);
        this.x = 0;
        this.y = 10;
        this.width = 200;
        this.height = 50
        this.setPercentage(100);
    }

    setPercentage(percentage){
        this.percentage = percentage;
        let path = this.IMAGES_COINBAR[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex(){
            if (this.percentage == 100) {
                return 5;
            }else if (this.percentage > 80) {
                return 4;
            }else if (this.percentage > 60) {
                return 3;
            }else if (this.percentage > 40) {
                return 2;
            }else if (this.percentage > 20) {
                return 1;
            }else {
                return 0;
            }
    }
}