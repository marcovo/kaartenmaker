import Map from "./Map";
import Cutout from "./Cutout";
import {A4L, Paper} from "../Util/Paper";
import Conversion from "../Conversion/Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "../Coordinates/DutchGrid";
import WGS84_DutchGrid from "../Conversion/WGS84_DutchGrid";
import Projection from "./Projection";
import {WmsKadaster25} from "../Util/Wms";
import Cache from "../Util/Cache";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any, any, any, any>[] = [];
    private cutoutsCounter = 0;

    constructor() {

        $(() => {
            this.onLoad();
        });

    }

    onLoad() {
        this.map = new Map('map-canvas');
        this.addCutout();

        $('#print').on('click', () => {
            this.print();
        });

        var app = new Vue({
            el: '#app',
            data: {
                message: 'Hello Vue!'
            }
        })
    }

    addCutout() {
        const id = this.cutoutsCounter++;
        this.cutouts[id] = new Cutout(
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

        this.cutouts[id].addToMap(this.map);
    }

    print(): void {
        const cache = new Cache('image_cache');
        cache.initialize().then(() => {
           this.cutouts[0].print(cache).then(() => {
               return cache.clean();
           });
        });
    }

}
