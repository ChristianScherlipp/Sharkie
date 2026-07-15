class World {
    character = new Character();
    
    enemies = [
        new Pufferfish(),
        new Pufferfish(),
        new Pufferfish(),
        new Jellyfish(),
        new Finalboss(),
    ];
    lights = [new Light()];
    backgroundObjects = [
        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 0),
    ];
    

    canvas;
    ctx;
    keyboard;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
    }

    draw(){
        // Canvas Clearen um neu geladenen bilder anzuzeigen 
        // und das vorgänger bild aus dem canvas entfernt wird.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addObjectsToMap(this.backgroundObjects); // Background laden
        this.addObjectsToMap(this.lights); // Licht Laden
        this.addObjectsToMap(this.enemies); // Gegner aus dem Array enemies laden
        this.addToMap(this.character); // Character laden
        

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
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }
    // Image Spiegeln
    flipImage (mo){
        this.ctx.save();
            this.ctx.translate(mo.width, 0);
            this.ctx.scale(-1, 1)
            mo.x = mo.x * -1;
    }
    // gespiegeltest Image zurücksetzen
    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    setWorld(){
        this.character.world = this;
    }
}