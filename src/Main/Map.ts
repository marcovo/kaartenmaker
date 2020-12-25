
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Cutout from "./Cutout";
import Coordinate from "../Coordinates/Coordinate";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";

export default class Map {

    private leafletMap: L.map;

    constructor(private id: string) {

        this.leafletMap = L.map(id).setView([52.1, 5.0], 8);

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.leafletMap);

        this.leafletMap.zoomControl.setPosition('bottomright');

        this.leafletMap.on('contextmenu', function(e) {

        });

        this.leafletMap.on('click', function(e) {

        });

        this.leafletMap.on('mousedown', function(e) {

        });
        this.leafletMap.on('movestart', function(e) {

        });
        this.leafletMap.on('mousemove', function(e) {

        });

    }

    getLeafletMap(): L.map {
        return this.leafletMap;
    }

    fitToCutouts(cutouts: Cutout<Coordinate & LeafletConvertibleCoordinate, any, any>[]): void {
        if(cutouts.length === 0) {
            return;
        }

        let minLat = null, maxLat = null, minLng = null, maxLng = null;

        for(const cutout of cutouts) {
            for(const wsCoordinate of cutout.mapPolygonWorkspace) {
                const coord = wsCoordinate.toLeaflet();
                if(minLat === null || coord.lat < minLat) {
                    minLat = coord.lat;
                }
                if(maxLat === null || coord.lat > maxLat) {
                    maxLat = coord.lat;
                }

                if(minLng === null || coord.lng < minLng) {
                    minLng = coord.lng;
                }
                if(maxLng === null || coord.lng > maxLng) {
                    maxLng = coord.lng;
                }
            }
        }

        this.leafletMap.fitBounds([
            [minLat, minLng],
            [maxLat, maxLng],
        ]);
    }
}
