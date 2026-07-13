class World {
    character = new Character();
    
    enemies = [
        new Pufferfish(),
        new Jellyfish(),
        new Finalboss(),
    ];
    lights = [new Light()];
    substratebases = [new Substratebase()]

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
        // Character laden
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.width, this.character.height);
        // Licht Laden
        this.lights.forEach(light => {
            this.ctx.drawImage(light.img, light.x, light.y, light.width, light.height);
        });
        // Bodengrund laden
        this.substratebases.forEach(substratebases => {
            this.ctx.drawImage(substratebases.img, substratebases.x, substratebases.y, substratebases.width, substratebases.height);
        });
        // Gegner aus dem Array enemies laden
        this.enemies.forEach(enemy => {
            this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
        });
        // Draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
    }
}