import Coordinate from "./Coordinate";
import * as L from 'leaflet';
import CoordinateSystem from "./CoordinateSystem";
import LeafletConvertibleCoordinate from "./LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "./LeafletConvertibleCoordinateSystem";
import Conversion from "../Conversion/Conversion";
import WGS84_DutchGrid from "../Conversion/WGS84_DutchGrid";
import WGS84_UTM from "../Conversion/WGS84_UTM";

export class WGS84System implements CoordinateSystem<WGS84>, LeafletConvertibleCoordinateSystem<WGS84> {
    readonly name = 'EPSG:4326';

    make(lat: number, lng: number): WGS84 {
        return new WGS84(lat, lng);
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

    clone(): WGS84 {
        return new WGS84(this.lat, this.lng);
    }

    toLeaflet(): L.LatLng {
        return new L.LatLng(this.lat, this.lng);
    }

    withinBounds(): boolean {
        return -180 <= this.lng && this.lng <= 180 && -90 <= this.lat && this.lat <= 90;
    }
}
