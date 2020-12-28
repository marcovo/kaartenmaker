import Coordinate from "./Coordinate";
import CoordinateSystem from "./CoordinateSystem";
import Conversion from "../Conversion/Conversion";
import UTM_WGS84 from "../Conversion/UTM_WGS84";
import {trimTrailingZeroDecimalPlaces} from "../Util/functions";
import {Point} from "../Util/Math";

export class UTMSystem implements CoordinateSystem<UTM> {
    readonly code = 'EPSG:25832';
    readonly name = 'UTM';

    constructor(readonly zone: number = null, readonly hemi: number = null) {
    }

    make(E: number, N: number): UTM {
        if(this.zone === null || this.hemi === null) {
            throw new Error('Cannot create UTM coordinate from incomplete system specification');
        }
        return new UTM(E, N, this.zone, this.hemi);
    }

    fromPoint(point: Point): UTM {
        return new UTM(point.getX(), point.getY(), this.zone, this.hemi);
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
    readonly code = 'EPSG:25832';

    constructor(readonly E: number, readonly N: number, readonly zone: number, readonly hemi: number) {
    }

    getX(): number {
        return this.E;
    }

    getY(): number {
        return this.N;
    }

    clone<C extends this>(): C {
        return <C>new UTM(this.E, this.N, this.zone, this.hemi);
    }

    withinBounds(): boolean {
        return true; // todo
    }

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean {
        if(this.code !== coordinateSystem.code || !(coordinateSystem instanceof UTMSystem)) {
            return false;
        }

        return this.zone === coordinateSystem.zone && this.hemi === coordinateSystem.hemi;
    }

    formatOrdinateForPdf(dimension: 'x' | 'y'): string {
        const ordinate = (dimension === 'x') ? this.getX() : this.getY();
        return trimTrailingZeroDecimalPlaces(ordinate / 1000, 1);
    }

    formats(): Record<string, () => string> {
        return {};
    }

    defaultFormat(): string {
        return undefined;
    }
}
