import Coordinate from "./Coordinate";
import { LatLng } from 'leaflet';
import CoordinateSystem from "./CoordinateSystem";
import LeafletConvertibleCoordinate from "./LeafletConvertibleCoordinate";

export class WGS84System implements CoordinateSystem<WGS84> {
    make(lat: number, lng: number): WGS84 {
        return new WGS84(lat, lng);
    }
}

export default class WGS84 implements Coordinate, LeafletConvertibleCoordinate {
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

    static fromLeaflet(source: LatLng): WGS84 {
        return new WGS84(source.lat, source.lng);
    }

    toLeaflet(): LatLng {
        return new LatLng(this.lat, this.lng);
    }

    withinBounds(): boolean {
        return -180 <= this.lng && this.lng <= 180 && -90 <= this.lat && this.lat <= 90;
    }
}
