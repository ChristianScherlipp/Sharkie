class Jellyfish extends MovableObject {
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.jelly_fish/Regular_damage/Lila4.png',
    ];
    currentImage = 0;

    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.x = 190 + Math.random() * 500;
        this.y = Math.random() * 440;
        this.width = 120;
        this.height = 180;

        this.animate();
    }

    animate() {
        setInterval(() => {
            let i = this.currentImage % this.JELLY_IMAGES_SWIM.length;
            let path = this.JELLY_IMAGES_SWIM[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 255);
    }
}