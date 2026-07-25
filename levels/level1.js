import { Level } from "../models/level.class.js";
import { Pufferfish } from "../models/pufferfish.class.js";
import { Jellyfish } from "../models/jellyfish.class.js";
import { Finalboss } from "../models/finalboss.class.js";
import { Coin } from "../models/coin.class.js";
import { Light } from "../models/light.class.js";
import { BackgroundObject } from "../models/background-object.class.js";

export const level1 = new Level(
    [
        new Pufferfish(),
        new Pufferfish(),
        new Pufferfish(),
        new Jellyfish(),
        new Jellyfish(),
        new Finalboss(),
    ],

    [
        new Coin(250, 250),
        new Coin(290, 230),
        new Coin(330, 220),
        new Coin(370, 220),
        new Coin(410, 230),
        new Coin(450, 250),
    ],

    [
        new Light()
    ],

    [
        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 0),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 719),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 719),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 719),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 719),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 719*2),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 719*2),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 719*2),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 719*2),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 719*3),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 719*3),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 719*3),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 719*3),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 719*4),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 719*4),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 719*4),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 719*4),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 719*5),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 719*5),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 719*5),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 719*5),
    ]
);