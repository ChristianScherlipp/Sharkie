import { MovableObject } from "./movable-object.class.js";

/**
 *  An extension of MovableObject that can collide with other CollidableObjects.
*/
export class CollidableObject extends MovableObject {

    /**
     * @type {object} - Numerical offset for this instance's coordinates and dimensons,
     * used for collision check
     */
    offset = {
        top : 0,
        left : 0,
        right : 0,
        bottom : 0
    };
}