import Map from "./Map";
import Cutout from "./Cutout";
import Container from "./Container";
import Cache from "../Util/Cache";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';
import * as L from 'leaflet';
import ActionHistory from "../ActionHistory/ActionHistory";
import AddCutoutAction from "../ActionHistory/AddCutoutAction";
import DeleteCutoutAction from "../ActionHistory/DeleteCutoutAction";
import CutoutTemplate from "./CutoutTemplate";
import Printer from "./Printer";
require('../Lib/LeafletDrag');
require("./Cutout"); // If we don't explicitly require this, the application crashes...

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any>[] = [];

    private cutoutList: Vue;
    private cutoutTemplateList: Vue;
    private lastAddedCutoutTemplateId: number = null;

    readonly colors: string[];

    readonly actionHistory: ActionHistory;

    constructor() {

        this.colors = ['#03f', 'aqua', 'black', 'blue', 'fuchsia', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'teal', 'yellow'];

        this.actionHistory = new ActionHistory();

        $(() => {
            this.onLoad();

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
                print: (cutout: Cutout<any, any, any>) => {
                    this.print(cutout);
                },
                deleteCutout: (cutout: Cutout<any, any, any>) => {
                    this.deleteCutout(cutout);
                },
                duplicateCutout: (cutout: Cutout<any, any, any>) => {
                    this.duplicateCutout(cutout);
                },
                downloadLegend: (cutout: Cutout<any, any, any>) => {
                    cutout.getProjection().wms.downloadLegend();
                },
                mouseover: (cutout: Cutout<any, any, any>) => {
                    cutout.mouseover();
                },
                mouseout: (cutout: Cutout<any, any, any>) => {
                    cutout.mouseout();
                }
            }
        });

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

        this.cutoutTemplateList = new Vue({
            el: '#cutoutTemplateList',
            data: {
                cutoutTemplates: Container.cutoutTemplateList(),
            },
            methods: {
                click: (cutoutTemplate: CutoutTemplate<any, any, any>) => {
                    this.addCutoutFromTemplate(cutoutTemplate);
                    toggle_menu(false);
                },
            }
        });

        this.addCutout();
    }

    addCutoutFromTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        const cutout = cutoutTemplate.makeCutout(this);

        cutout.name = 'Mijn kaart ' + (cutout.id+1);
        cutout.color = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.actionHistory.addAction(new AddCutoutAction(
            cutout,
            this,
            this.cutouts.length
        ));

        this.lastAddedCutoutTemplateId = cutoutTemplate.id;
    }

    addCutout() {
        const cutoutTemplates = Container.cutoutTemplateList();
        if(cutoutTemplates.length === 0) {
            throw new Error('No cutout templates');
        }

        let cutoutTemplate = null;
        if(this.lastAddedCutoutTemplateId !== null) {
            for(const item of cutoutTemplates) {
                if(item.id === this.lastAddedCutoutTemplateId) {
                    cutoutTemplate = item;
                    break;
                }
            }
        }

        if(cutoutTemplate === null) {
            cutoutTemplate = cutoutTemplates[0];
        }

        this.addCutoutFromTemplate(cutoutTemplate);
    }

    public attachCutout(cutout: Cutout<any, any, any>, position: number) {
        cutout.addToMap(this.map);
        this.cutouts.splice(position, 0, cutout);
    }

    public detachCutout(cutout: Cutout<any, any, any>) {
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

    print(cutout: Cutout<any, any, any>): void {
        cutout.print().catch((e) => {
            console.log(e);
            alert('Something went wrong while printing');
        });
    }

    deleteCutout(cutout: Cutout<any, any, any>): void {
        const index = this.cutouts.indexOf(cutout);
        if(index > -1) {
            this.actionHistory.addAction(new DeleteCutoutAction(cutout, this));
        }
    }

    duplicateCutout(sourceCutout: Cutout<any, any, any>): void {
        const newCutout = sourceCutout.clone();

        newCutout.name = sourceCutout.name + ' (kopie)';
        newCutout.color = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.actionHistory.addAction(new AddCutoutAction(
            newCutout,
            this,
            this.cutouts.length
        ));
    }

}
