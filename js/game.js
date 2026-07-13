let canvas;
let ctx;
let character = new Image();

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    character.src = '../assets/img/1.Sharkie/3.Swim/1.png';

    ctx.drawImage(character, 20, 20, 140, 150)
}