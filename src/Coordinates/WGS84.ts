import Coordinate from "./Coordinate";
import { LatLng } from 'leaflet';

export default class WGS84 implements Coordinate {
    readonly lat: number;
    readonly lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    static fromLeaflet(source: LatLng): WGS84 {
        return new WGS84(source.lat, source.lng);
    }

    toLeaflet(): LatLng {
        return new LatLng(this.lat, this.lng);
    }
}
