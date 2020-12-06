import Coordinate from "./Coordinate";
import CoordinateSystem from "./CoordinateSystem";

export class UTMSystem implements CoordinateSystem<UTM> {
    constructor(readonly zone: number, readonly hemi: number) {
    }

    make(E: number, N: number): UTM {
        return new UTM(E, N, this.zone, this.hemi);
    }
}

export default class UTM implements Coordinate {
    constructor(readonly E: number, readonly N: number, readonly zone: number, readonly hemi: number) {
    }

    getX(): number {
        return this.E;
    }

    getY(): number {
        return this.N;
    }

    withinBounds(): boolean {
        return true; // todo
    }
}
