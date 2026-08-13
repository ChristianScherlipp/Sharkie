import { Level } from "../models/level.class.js";
import { Pufferfish } from "../models/pufferfish.class.js";
import { Jellyfish } from "../models/jellyfish.class.js";
import { Finalboss } from "../models/finalboss.class.js";
import { Coin } from "../models/coin.class.js";
import { Light } from "../models/light.class.js";
import { BackgroundObject } from "../models/background-object.class.js";
import { BigCoin } from "../models/big-coin.class.js";
import { Poison } from "../models/poison.class.js";
import { Net } from "../models/net.class.js";

export function createLevl1() {
    return new Level(
    [
        new Pufferfish(500, 250),
        new Jellyfish(1009, 150),
        new Pufferfish(1518, 350),
        new Jellyfish(2027, 100),
        new Pufferfish(2536, 300),
        new Jellyfish(3045, 200),
        new Pufferfish(3554, 280),
        new Jellyfish(4063, 120),
        new Pufferfish(4572, 320),
        new Jellyfish(5081, 180),
        new Pufferfish(5590, 260),
        new Jellyfish(5099, 140),
        new Finalboss(6900, 5),
    ],

    // Hinweis: Alle Coins bleiben vor x=5752 - die letzten beiden
    // Hintergrund-Bereiche (Start bei 5752 und 6471) sind bewusst coin-frei,
    // damit dort der Endkampf gegen den Finalboss ohne Ablenkung stattfindet.
    // Gesamtwert (Coin.value Summe) liegt bei ca. 140.
    [
        new Coin(150, 60),
        new Coin(258, 105),
        new Coin(366, 150),
        new Coin(474, 195),
        new Coin(582, 240),
        new Coin(690, 285),
        new Coin(798, 330),
        new Coin(906, 60),
        new Coin(1014, 105),
        new Coin(1122, 150),
        new Coin(1230, 195),
        new Coin(1338, 240),
        new Coin(1446, 285),
        new Coin(1554, 330),
        new Coin(1662, 60),
        new Coin(1770, 105),
        new Coin(1878, 150),
        new Coin(1986, 195),
        new Coin(2094, 240),
        new Coin(2202, 285),
        new Coin(2310, 330),
        new Coin(2418, 60),
        new Coin(2526, 105),
        new Coin(2634, 150),
        new Coin(2742, 195),
        new Coin(2850, 240),
        new Coin(2958, 285),
        new Coin(3066, 330),
        new Coin(3174, 60),
        new Coin(3282, 105),
        new Coin(3390, 150),
        new Coin(3498, 195),
        new Coin(3606, 240),
        new Coin(3714, 285),
        new Coin(3822, 330),
        new Coin(3930, 60),
        new Coin(4038, 105),
        new Coin(4146, 150),
        new Coin(4254, 195),
        new Coin(4362, 240),
        new Coin(4470, 285),
        new Coin(4578, 330),
        new Coin(4686, 60),
        new Coin(4794, 105),
        new Coin(4902, 150),
        new Coin(5010, 195),
        new Coin(5118, 240),
        new Coin(5226, 285),
        new Coin(5334, 330),
        new Coin(5442, 60),
        new Coin(5550, 105),
        new Coin(5658, 150),

        new BigCoin(300, 80),
        new BigCoin(745, 150),
        new BigCoin(1190, 220),
        new BigCoin(1635, 290),
        new BigCoin(2080, 360),
        new BigCoin(2525, 80),
        new BigCoin(2970, 150),
        new BigCoin(3415, 220),
        new BigCoin(3860, 290),
        new BigCoin(4305, 360),
        new BigCoin(4750, 80),
        new BigCoin(5195, 150),
    ],

    [
        new Poison(350, 100),
        new Poison(870, 180),
        new Poison(1390, 260),
        new Poison(1910, 340),
        new Poison(2430, 100),
        new Poison(2950, 180),
        new Poison(3470, 260),
        new Poison(3990, 340),
        new Poison(4510, 100),
        new Poison(5030, 180),
    ],
    
        new Net(5752),

    [
        new Light()
    ],

    [
        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 0),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 0),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 720),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 720),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 720),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 720),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 720 * 2),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 720 * 2),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 720 * 2),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 720 * 2),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 720 * 3),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 720 * 3),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 720 * 3),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 720 * 3),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 720 * 4),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 720 * 4),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 720 * 4),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 720 * 4),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 720 * 5),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 720 * 5),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 720 * 5),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 720 * 5),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 720 * 6),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 720 * 6),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 720 * 6),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 720 * 6),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 720 * 7),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 720 * 7),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 720 * 7),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 720 * 7),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D1.png', 720 * 8),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D1.png', 720 * 8),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D1.png', 720 * 8),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D1.png', 720 * 8),

        new BackgroundObject('./assets/img/3.Background/Layers/5.Water/D2.png', 720 * 9),
        new BackgroundObject('./assets/img/3.Background/Layers/4.Fondo2/D2.png', 720 * 9),
        new BackgroundObject('./assets/img/3.Background/Layers/3.Fondo1/D2.png', 720 * 9),
        new BackgroundObject('./assets/img/3.Background/Layers/2.Floor/D2.png', 720 * 9),
    ]
    );
}