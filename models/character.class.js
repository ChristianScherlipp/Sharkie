class Character extends MovableObject {
    width = 250;
    height = 290;
    y = 150;
    IMAGES_SWIM = [
            './assets/img/1.Sharkie/3.Swim/1.png',
            './assets/img/1.Sharkie/3.Swim/2.png',
            './assets/img/1.Sharkie/3.Swim/3.png',
            './assets/img/1.Sharkie/3.Swim/4.png',
            './assets/img/1.Sharkie/3.Swim/5.png',
            './assets/img/1.Sharkie/3.Swim/6.png',
        ];
    currentImage = 0;

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.x = 20;

        this.animate();
    }

    animate() {
        setInterval(() => {
            let i = this.currentImage % this.IMAGES_SWIM.length;
            let path = this.IMAGES_SWIM[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 150);
    }
}