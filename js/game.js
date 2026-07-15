let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    console.log('My Character is', world.character);
    
}

window.addEventListener('keydown', (e) => {
    if(e.keyCode == 68 || e.keyCode == 39) {
        keyboard.RIGHT = true;
    }
    if(e.keyCode == 65 || e.keyCode == 37) {
        keyboard.LEFT = true;
    }
    if(e.keyCode == 87 || e.keyCode == 38) {
        keyboard.UP = true;
    }
    if(e.keyCode == 83 || e.keyCode == 40) {
        keyboard.DOWN = true;
    }
    if(e.keyCode == 32) {
        keyboard.SPACE = true;
    }
    console.log(e);
    
});