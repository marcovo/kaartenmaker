import Coordinate from "./Coordinate";

export default class DutchGrid implements Coordinate {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
