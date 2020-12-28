import Coordinate from "./Coordinate";
import CoordinateSystem from "./CoordinateSystem";
import Conversion from "../Conversion/Conversion";
import DutchGrid_WGS84 from "../Conversion/DutchGrid_WGS84";
import {trimTrailingZeroDecimalPlaces} from "../Util/functions";
import {Point} from "../Util/Math";

export class DutchGridSystem implements CoordinateSystem<DutchGrid> {
    readonly code = 'EPSG:28992';
    readonly name = 'RD Nederland';

    make(x: number, y: number): DutchGrid {
        return new DutchGrid(x, y);
    }

    fromPoint(point: Point): DutchGrid {
        return new DutchGrid(point.getX(), point.getY());
    }

    conversions(): Conversion<DutchGrid, Coordinate>[] {
        return [
            new DutchGrid_WGS84(),
        ];
    }

    rebase(c: DutchGrid): DutchGridSystem {
        return this;
    }
}

export default class DutchGrid implements Coordinate {
    readonly code = 'EPSG:28992';

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

    clone<C extends this>(): C {
        return <C>new DutchGrid(this.x, this.y);
    }

    withinBounds(): boolean {
        // TODO: Check with polygon; https://nl.wikipedia.org/wiki/Rijksdriehoeksco%C3%B6rdinaten#Geldigheid
        return -7000 <= this.x && this.x <= 300000 && 289000 <= this.y && this.y <= 629000;
    }

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean {
        return this.code === coordinateSystem.code;
    }

    formatOrdinateForPdf(dimension: 'x' | 'y'): string {
        const ordinate = (dimension === 'x') ? this.getX() : this.getY();
        return trimTrailingZeroDecimalPlaces(ordinate / 1000, 3);
    }

    formats(): Record<string, () => string> {
        return {
            meter: (): string => {
                return Math.round(this.x) + ', ' + Math.round(this.y);
            },
            km3: (): string => {
                return (Math.round(this.x)/1000).toFixed(3).replace('.', ',')
                    + ' - '
                    + (Math.round(this.y)/1000).toFixed(3).replace('.', ',');
            },
            km2: (): string => {
                return (Math.round(this.x/10)/100).toFixed(2).replace('.', ',')
                    + ' - '
                    + (Math.round(this.y/10)/100).toFixed(2).replace('.', ',');
            },
        };
    }

    defaultFormat(): string {
        return 'km2';
    }
}
