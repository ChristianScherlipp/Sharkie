class Statusbar extends DrawableObject{

    IMAGES_HEALTHBARS = [
        './assets/img/4.Marcadores/green/Life/0_copia3.png',
        './assets/img/4.Marcadores/green/Life/20_copia3.png',
        './assets/img/4.Marcadores/green/Life/40_copia3.png',
        './assets/img/4.Marcadores/green/Life/60_copia3.png',
        './assets/img/4.Marcadores/green/Life/80_copia3.png',
        './assets/img/4.Marcadores/green/Life/100_copia3.png'
    ];

    percentage;

    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTHBARS);
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 50
        this.setPercentage(100);
    }

    setPercentage(percentage){
        this.percentage = percentage;
        let path = this.IMAGES_HEALTHBARS[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex(){
            if (this.percentage == 100) {
                return 5;
            }else if (this.percentage >= 80) {
                return 4;
            }else if (this.percentage >= 60) {
                return 3;
            }else if (this.percentage >= 40) {
                return 2;
            }else if (this.percentage >= 20) {
                return 1;
            }else {
                return 0;
            }
    }
}