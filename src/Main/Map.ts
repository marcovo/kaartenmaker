
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}
