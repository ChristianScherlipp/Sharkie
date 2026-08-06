import { Keyboard } from '../models/keyboard.class.js';
import { World } from "../models/world.class.js";

let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    console.log('My Character is', world.character);
    
}

function startGame() {

    const startScreen = document.getElementById("start-screen");

    startScreen.classList.add("fade-out");

    setTimeout(() => {

        startScreen.style.display = "none";

        document.getElementById("canvas").style.display = "block";

        init();

    }, 800);

}

function openControls() {

    const popup = document.getElementById("popup");
    const text = document.getElementById("popup-text");

    text.innerHTML = `
        <h2>Steuerung</h2>

        <br>

        ⬅️ ➡️ Pfeiltasten oder A / D<br><br>

        ⬆️ ⬇️ W / S<br><br>

        Leertaste = Angriff<br><br>

        Q / E = Spezial
    `;

    popup.classList.remove("hidden");

}

function openCredits() {

    const popup = document.getElementById("popup");
    const text = document.getElementById("popup-text");

    text.innerHTML = `
        <h2>Sharkie</h2>

        <br>

        Entwickelt von

        <br><br>

        Christian Scherlipp

        <br><br>

        in Zusammenarbeit mit der

        <br><br>

        Developer Akademie
    `;

    popup.classList.remove("hidden");

}

function closePopup(){

    document
        .getElementById("popup")
        .classList.add("hidden");

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
    if (e.key.toLocaleLowerCase() == 'e') {
        keyboard.E = true;
    }
    if (e.key.toLocaleLowerCase() == 'q') {
        keyboard.Q = true;
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
    if (e.key.toLocaleLowerCase() == 'e') {
        keyboard.E = false;
    }
    if (e.key.toLocaleLowerCase() == 'q') {
        keyboard.Q = false;
    }
});

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("start-btn")
        .addEventListener("click", startGame);

    document
        .getElementById("controls-btn")
        .addEventListener("click", openControls);

    document
        .getElementById("credits-btn")
        .addEventListener("click", openCredits);

    document
        .getElementById("close-popup")
        .addEventListener("click", closePopup);

});