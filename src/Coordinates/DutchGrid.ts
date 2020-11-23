import Coordinate from "./Coordinate";
import CoordinateSystem from "./CoordinateSystem";

export class DutchGridSystem implements CoordinateSystem<DutchGrid> {
    make(x: number, y: number): DutchGrid {
        return new DutchGrid(x, y);
    }
}

export default class DutchGrid implements Coordinate {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    withinBounds(): boolean {
        // TODO: Check with polygon; https://nl.wikipedia.org/wiki/Rijksdriehoeksco%C3%B6rdinaten#Geldigheid
        return -7000 <= this.x && this.x <= 300000 && 289000 <= this.y && this.y <= 629000;
    }
}
