import Coordinate from "./Coordinate";
import * as L from 'leaflet';
import CoordinateSystem from "./CoordinateSystem";
import LeafletConvertibleCoordinate from "./LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "./LeafletConvertibleCoordinateSystem";
import Conversion from "../Conversion/Conversion";
import WGS84_DutchGrid from "../Conversion/WGS84_DutchGrid";
import WGS84_UTM from "../Conversion/WGS84_UTM";
import {Point} from "../Util/Math";
import {padLeadingZeros, trimTrailingZeroDecimalPlaces} from "../Util/functions";

export class WGS84System implements CoordinateSystem<WGS84>, LeafletConvertibleCoordinateSystem<WGS84> {
    readonly name = 'EPSG:4326';

    make(lat: number, lng: number): WGS84 {
        return new WGS84(lat, lng);
    }

    fromPoint(point: Point): WGS84 {
        return new WGS84(point.getY(), point.getX());
    }

    fromLeaflet(source: L.LatLng): WGS84 {
        return this.make(source.lat, source.lng);
    }

    conversions(): Conversion<WGS84, Coordinate>[] {
        return [
            new WGS84_DutchGrid(),
            new WGS84_UTM(),
        ];
    }

    rebase(c: WGS84): WGS84System {
        return this;
    }
}

export default class WGS84 implements Coordinate, LeafletConvertibleCoordinate {
    readonly name = 'EPSG:4326';

    readonly lat: number;
    readonly lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    getX(): number {
        return this.lng;
    }

    getY(): number {
        return this.lat;
    }

    clone<C extends this>(): C {
        return <C>new WGS84(this.lat, this.lng);
    }

    toLeaflet(): L.LatLng {
        return new L.LatLng(this.lat, this.lng);
    }

    withinBounds(): boolean {
        return -180 <= this.lng && this.lng <= 180 && -90 <= this.lat && this.lat <= 90;
    }

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean {
        return this.name === coordinateSystem.name;
    }

    formatOrdinateForPdf(dimension: 'x' | 'y'): string {
        return ''; // TODO
    }

    formats(): Record<string, () => string> {
        return {
            raw: (): string => {
                const lat = trimTrailingZeroDecimalPlaces(this.lat, 6);
                const lng = trimTrailingZeroDecimalPlaces(this.lng, 6);
                return lat + ',' + lng;
            },
            deg: (): string => {
                return this.formatDeg(Math.abs(this.lat)) + this.formatNS(this.lat)
                    + ', '
                    + this.formatDeg(Math.abs(this.lng)) + this.formatWE(this.lng);
            },
            degmin: (): string => {
                return this.formatDegMin(Math.abs(this.lat)) + this.formatNS(this.lat)
                    + ', '
                    + this.formatDegMin(Math.abs(this.lng)) + this.formatWE(this.lng);
            },
            degminsec: (): string => {
                return this.formatDegMinSec(Math.abs(this.lat)) + this.formatNS(this.lat)
                    + ', '
                    + this.formatDegMinSec(Math.abs(this.lng)) + this.formatWE(this.lng);
            },
        };
    }

    private formatNS(degrees: number): string {
        return degrees < 0 ? 'S' : 'N';
    }

    private formatWE(degrees: number): string {
        return degrees < 0 ? 'W' : 'E';
    }

    private formatDeg(degrees: number) {
        return degrees.toFixed(6) + '°';
    }

    private formatDegMin(degrees: number) {
        const deg = Math.floor(degrees);
        const min = (degrees - deg) * 60;

        return deg + '°' + (min < 10 ? '0' : '') + min.toFixed(3) + "'";
    }

    private formatDegMinSec(degrees: number) {
        const deg = Math.floor(degrees);
        const minutes = (degrees - deg) * 60;
        const min = Math.floor(minutes);
        const sec = (minutes - min) * 60;

        return deg + '°' + padLeadingZeros(min, 2) + "'" + (sec < 10 ? '0' : '') + sec.toFixed(2) + '"';
    }
}
