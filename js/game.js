import { Keyboard } from '../models/keyboard.class.js';
import { World } from "../models/world.class.js";
import { GameOverlay } from "../models/game-overlay.class.js"
import { getControlTemplate, getCreditsTemplate } from './template.js';

let canvas;
let world;
let keyboard = new Keyboard();

let overlay = new GameOverlay(
    {
        overlay: document.getElementById('overlay'),
        banner: document.getElementById('overlay-banner'),
        buttons: document.getElementById('overlay-buttons'),
        tryAgainBtn: document.getElementById('btn-try-again'),
        backMenuBtn: document.getElementById('btn-back-menu'),
    },
    {
        onTryAgain: () => restartGame(),
        onBackToMenu: () => backToMenu(),
    }
);

function init() {
    canvas = document.getElementById('canvas');
    overlay.reset();
    resetKeyboard();
    
    world = new World(canvas, keyboard, {
        onGameOver: () => overlay.showGameOver(),
        onWinBanner: () => overlay.showWinBanner(),
        onWinFinal: () => overlay.showWinFinal(),
    });

    console.log('My Character is', world.character);
    
}

// Startet das Spiel neu, ohne die komplette Seite neu zu laden - erzeugt
// einfach eine frische World (inkl. frischem Level dank createLevel1()).
function restartGame() {
    init();
}

// Für "Back to Menu" gibt es aktuell noch keine eigene Menü-Ansicht im
// Projekt - die Seite selbst ist momentan der Einstiegspunkt, deshalb landet
// man hier vorerst wieder ganz am Anfang. Sobald es eine echte Menü-Seite
// gibt, kann hier stattdessen z.B. dorthin navigiert werden.
function backToMenu() {
    location.reload();
}

function resetKeyboard() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.E = false;
    keyboard.Q = false;
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

    text.innerHTML = getControlTemplate();

    popup.classList.remove("hidden");

}

function openCredits() {

    const popup = document.getElementById("popup");
    const text = document.getElementById("popup-text");

    text.innerHTML = getCreditsTemplate();

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