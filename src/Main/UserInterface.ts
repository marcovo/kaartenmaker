import Map from "./Map";
import Cutout from "./Cutout";
import {A4L, Paper} from "../Util/Paper";
import Conversion from "../Conversion/Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "../Coordinates/DutchGrid";
import WGS84_DutchGrid from "../Conversion/WGS84_DutchGrid";
import Projection from "./Projection";
import {WmsGermanyRP, WmsKadaster25} from "../Util/Wms";
import Cache from "../Util/Cache";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';
import * as L from 'leaflet';
import UTM, {UTMSystem} from "../Coordinates/UTM";
import WGS84_UTM from "../Conversion/WGS84_UTM";
require('../Lib/LeafletDrag');

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any, any, any, any>[] = [];
    private cutoutsCounter = 0;

    private cutoutList: Vue;

    readonly colors: string[];

    constructor() {

        this.colors = ['#03f', 'aqua', 'black', 'blue', 'fuchsia', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'teal', 'yellow'];

        $(() => {
            this.onLoad();
        });

    }

    onLoad() {
        this.map = new Map('map-canvas');

        $('#addButton').on('click', () => {
            this.addCutout();
        });

        this.cutoutList = new Vue({
            el: '#cutoutList',
            data: {
                cutouts: this.cutouts,
            },
            methods: {
                print: (cutout: Cutout<any, any, any, any, any, any>) => {
                    this.print(cutout);
                },
                deleteCutout: (cutout: Cutout<any, any, any, any, any, any>) => {
                    this.deleteCutout(cutout);
                },
                mouseover: (cutout: Cutout<any, any, any, any, any, any>) => {
                    cutout.mouseover();
                },
                mouseout: (cutout: Cutout<any, any, any, any, any, any>) => {
                    cutout.mouseout();
                }
            }
        });

        this.addCutout();
    }

    addCutout() {
        const id = this.cutoutsCounter++;
        let cutout;
        if(id % 2) {
            cutout = new Cutout(
                this,
                id,
                new A4L(),
                new WGS84(52, 5),
                new WGS84System(),
                new DutchGridSystem(),
                new DutchGridSystem(),
                new WGS84_DutchGrid(),
                new WGS84_DutchGrid(),
                new Projection<DutchGrid>(new WmsKadaster25(), 25000),
            );
        } else {
            const wgs = new WGS84(50, 7);
            const utm = (new WGS84_UTM()).convert(wgs);
            cutout = new Cutout(
                this,
                id,
                new A4L(),
                wgs,
                new WGS84System(),
                new UTMSystem(utm.zone, utm.hemi),
                new UTMSystem(utm.zone, utm.hemi),
                new WGS84_UTM(),
                new WGS84_UTM(),
                new Projection<UTM>(new WmsGermanyRP(), 25000),
            );
        }


        cutout.name = 'Mijn kaart ' + (id+1);
        cutout.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        cutout.addToMap(this.map);

        this.cutouts.push(cutout);
    }

    getCutouts() {
        return this.cutouts;
    }

    print(cutout: Cutout<any, any, any, any, any, any>): void {
        const cache = new Cache('image_cache');
        cache.initialize().then(() => {
            cutout.print(cache).then(() => {
                return cache.clean();
            });
        });
    }

    deleteCutout(cutout: Cutout<any, any, any, any, any, any>): void {
        const index = this.cutouts.indexOf(cutout);
        if(index > -1) {
            cutout.removeFromMap(this.map);
            this.cutouts.splice(index, 1);
        }
    }

}
