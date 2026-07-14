class Light extends MovableObject {
    y = 0;
    width = 450;
    height = 450;

    constructor() {
        super().loadImage('./assets/img/3.Background/Layers/1.Light/1.png');
        this.x = Math.random() * 450;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.x -= 0.15;
        }, 1000 / 60);
    }
}