import Coordinate from "./Coordinate";
import CoordinateSystem from "./CoordinateSystem";
import Conversion from "../Conversion/Conversion";
import UTM_WGS84 from "../Conversion/UTM_WGS84";

export class UTMSystem implements CoordinateSystem<UTM> {
    readonly name = 'EPSG:25832';

    constructor(readonly zone: number, readonly hemi: number) {
    }

    make(E: number, N: number): UTM {
        return new UTM(E, N, this.zone, this.hemi);
    }

    conversions(): Conversion<UTM, Coordinate>[] {
        return [
            new UTM_WGS84(),
        ];
    }

    rebase(c: UTM): UTMSystem {
        if(c.zone !== this.zone || c.hemi !== this.hemi) {
            return new UTMSystem(c.zone, c.hemi);
        }
        return this;
    }
}

export default class UTM implements Coordinate {
    readonly name = 'EPSG:25832';

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
