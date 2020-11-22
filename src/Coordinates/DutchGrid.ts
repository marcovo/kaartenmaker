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
}
