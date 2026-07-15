class Jellyfish extends MovableObject {
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila4.png',
    ];

    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.x = 190 + Math.random() * 1800;
        this.y = Math.random() * 440;
        this.width = 120;
        this.height = 180;

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.JELLY_IMAGES_SWIM);
        }, 255);
    }
}