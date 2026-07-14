class World {
    character = new Character();
    
    enemies = [
        new Pufferfish(),
        new Jellyfish(),
        new Finalboss(),
    ];
    lights = [new Light()];
    backgroundObjects = [
        new BackgroundObject('../assets/img/3.Background/Layers/2.Floor/D1.png')
    ];
    

    canvas;
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw();
    }

    draw(){
        // Canvas Clearen um neu geladenen bilder anzuzeigen 
        // und das vorgänger bild aus dem canvas entfernt wird.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.addToMap(this.character); // Character laden
        this.addObjectsToMap(this.backgroundObjects); // Background laden
        this.addObjectsToMap(this.enemies); // Gegner aus dem Array enemies laden
        this.addObjectsToMap(this.lights); // Licht Laden


        // Draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
    }

    addObjectsToMap (objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap (mo){
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    }
}