import Map from "./Map";
import Cutout from "./Cutout";
import {A4L, Paper} from "../Util/Paper";
import Conversion from "../Conversion/Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "../Coordinates/DutchGrid";
import WGS84_DutchGrid from "../Conversion/WGS84_DutchGrid";
import Projection from "./Projection";
import Container from "./Container";
import Cache from "../Util/Cache";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';
import * as L from 'leaflet';
import UTM, {UTMSystem} from "../Coordinates/UTM";
import WGS84_UTM from "../Conversion/WGS84_UTM";
import Grid from "./Grid";
import ActionHistory from "../ActionHistory/ActionHistory";
import AddCutoutAction from "../ActionHistory/AddCutoutAction";
import DeleteCutoutAction from "../ActionHistory/DeleteCutoutAction";
require('../Lib/LeafletDrag');

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any, any>[] = [];
    private cutoutsCounter = 0;

    private cutoutList: Vue;
    private lastAddedMapType = null;

    readonly colors: string[];

    readonly actionHistory: ActionHistory;

    constructor() {

        this.colors = ['#03f', 'aqua', 'black', 'blue', 'fuchsia', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'teal', 'yellow'];

        this.actionHistory = new ActionHistory();

        $(() => {
            this.onLoad();

            let add_menu_showing = false;
            const toggle_menu = (show: boolean = null) => {
                if(show === null) {
                    show = !add_menu_showing;
                }
                $('#add_menu').toggle(show);
                add_menu_showing = show;
            };
            $('#add_button').on('click', () => {
                toggle_menu();
            });

            $('#add_nl').on('click', () => {
                this.addCutout('nl');
                toggle_menu(false);
            });

            $('#add_de_rp').on('click', () => {
                this.addCutout('de_rp');
                toggle_menu(false);
            });

            $('#undoButton').on('click', () => {
                this.actionHistory.undo();
            });

            $('#redoButton').on('click', () => {
                this.actionHistory.redo();
            });
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
                print: (cutout: Cutout<any, any, any, any>) => {
                    this.print(cutout);
                },
                deleteCutout: (cutout: Cutout<any, any, any, any>) => {
                    this.deleteCutout(cutout);
                },
                duplicateCutout: (cutout: Cutout<any, any, any, any>) => {
                    this.duplicateCutout(cutout);
                },
                mouseover: (cutout: Cutout<any, any, any, any>) => {
                    cutout.mouseover();
                },
                mouseout: (cutout: Cutout<any, any, any, any>) => {
                    cutout.mouseout();
                }
            }
        });

        this.addCutout();
    }

    addCutout(type: string = null) {
        type = type || this.lastAddedMapType;
        type = (type === 'de_rp') ? 'de_rp' : 'nl';
        const id = this.cutoutsCounter++;
        let cutout;
        if(type === 'nl') {
            cutout = new Cutout(
                this,
                id,
                new A4L(),
                new WGS84(52, 5),
                new WGS84System(),
                new Projection(Container.wms('nl_kad_25'), 25000),
                new Grid(new DutchGridSystem())
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
                new Projection(Container.wms('de_rp_25'), 25000),
                new Grid(new UTMSystem(utm.zone, utm.hemi))
            );
        }
        this.lastAddedMapType = type;


        cutout.name = 'Mijn kaart ' + (id+1);
        cutout.color = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.actionHistory.addAction(new AddCutoutAction(
            cutout,
            this,
            this.cutouts.length
        ));
    }

    public attachCutout(cutout: Cutout<any, any, any, any>, position: number) {
        cutout.addToMap(this.map);
        this.cutouts.splice(position, 0, cutout);
    }

    public detachCutout(cutout: Cutout<any, any, any, any>) {
        const index = this.cutouts.indexOf(cutout);
        if(index === -1) {
            throw new Error('Invalid cutout');
        }

        cutout.removeFromMap(this.map);
        this.cutouts.splice(index, 1);
    }

    getCutouts() {
        return this.cutouts;
    }

    print(cutout: Cutout<any, any, any, any>): void {
        const cache = new Cache('image_cache');
        cache.initialize().then(() => {
            cutout.print(cache).then(() => {
                return cache.clean();
            });
        });
    }

    deleteCutout(cutout: Cutout<any, any, any, any>): void {
        const index = this.cutouts.indexOf(cutout);
        if(index > -1) {
            this.actionHistory.addAction(new DeleteCutoutAction(cutout, this));
        }
    }

    duplicateCutout(sourceCutout: Cutout<any, any, any, any>): void {
        const id = this.cutoutsCounter++;
        const newCutout = new Cutout(
            this,
            id,
            sourceCutout.getPaper(),
            sourceCutout.anchorWorkspaceCoordinate.clone(),
            sourceCutout.workspaceCoordinateSystem,
            new Projection(
                Container.wms(sourceCutout.getProjection().wms.name),
                sourceCutout.getProjection().getScale(),
            ),
            new Grid(sourceCutout.getGrid().coordinateSystem)
        );

        newCutout.name = sourceCutout.name + ' (duplicaat)';
        newCutout.color = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.actionHistory.addAction(new AddCutoutAction(
            newCutout,
            this,
            this.cutouts.length
        ));
    }

}
