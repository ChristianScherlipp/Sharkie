let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    console.log('My Character is', world.character);
    
}

window.addEventListener('keydown', (e) => {
    if(e.key.toLocaleLowerCase() == 'd' || e.key == 'ArrowRight') {
        keyboard.RIGHT = true;
    }
    if(e.key.toLocaleLowerCase() == 'a' || e.key == 'ArrowLeft') {
        keyboard.LEFT = true;
    }
    if(e.key.toLocaleLowerCase() == 'w' || e.key == 'ArrowUp') {
        keyboard.UP = true;
    }
    if(e.key.toLocaleLowerCase() == 's' || e.key == 'ArrowDown') {
        keyboard.DOWN = true;
    }
    if(e.key == ' ') {
        keyboard.SPACE = true;        
    }
    
});

window.addEventListener('keyup', (e) => {
    if(e.key.toLocaleLowerCase() == 'd' || e.key == 'ArrowRight') {
        keyboard.RIGHT = false;
    }
    if(e.key.toLocaleLowerCase() == 'a' || e.key == 'ArrowLeft') {
        keyboard.LEFT = false;
    }
    if(e.key.toLocaleLowerCase() == 'w' || e.key == 'ArrowUp') {
        keyboard.UP = false;
    }
    if(e.key.toLocaleLowerCase() == 's' || e.key == 'ArrowDown') {
        keyboard.DOWN = false;
    }
    if(e.key == ' ') {
        keyboard.SPACE = false;
    }
});