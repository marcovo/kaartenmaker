import Map from "./Map";
import Cutout from "./Cutout";
import Container from "./Container";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';
import ActionHistory from "../ActionHistory/ActionHistory";
import AddCutoutAction from "../ActionHistory/AddCutoutAction";
import DeleteCutoutAction from "../ActionHistory/DeleteCutoutAction";
import CutoutTemplate from "./CutoutTemplate";
require('../Lib/LeafletDrag');
require("./Cutout"); // If we don't explicitly require this, the application crashes...

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any>[] = [];

    private cutoutList: Vue;
    private cutoutTemplateList: Vue;
    private cutoutDropdownMenu: Vue;
    private actionHistoryButtons: Vue;
    private lastAddedCutoutTemplateId: number = null;

    private cutoutCounter = 0;

    readonly colors: string[];

    readonly actionHistory: ActionHistory;

    constructor() {

        this.colors = ['blue', 'orange', 'green', 'fuchsia', 'lime', '#f33', '#ee0', 'aqua', 'black', 'maroon', 'navy', 'purple', 'teal', 'olive'];

        this.actionHistory = new ActionHistory();

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
                    cutout.getProjection().getMapImageProvider().downloadLegend();
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

        this.cutoutDropdownMenu = new Vue({
            el: '#cutoutDropdownMenu',
            data: {
                cutout: null,
            },
            methods: {
                settings: (cutout: Cutout<any, any, any>) => {
                    // TODO: kind of ugly...
                    $('#cutout_' + cutout.id + '_settings').trigger('click');
                },
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
                    cutout.getProjection().getMapImageProvider().downloadLegend();
                },
            }
        });

        this.actionHistoryButtons = new Vue({
            el: '#actionHistoryButtons',
            data: {
                actionHistory: this.actionHistory,
            },
            methods: {
                undo: () => {
                    this.actionHistory.undo();
                },
                redo: () => {
                    this.actionHistory.redo();
                },
            }
        });

        this.addCutout().then(() => {
            if(this.actionHistory.getLength() === 1) {
                this.actionHistory.clear();
            }
        });
    }

    openCutoutDropdownMenu(cutout: Cutout<any, any, any>, evt) {
        this.cutoutDropdownMenu.cutout = cutout;

        $('#cutoutDropdownMenuButton')
            .dropdown('show')
            .siblings('.dropdown-menu')
            .css({
                top: evt.originalEvent.clientY + 'px',
                left: evt.originalEvent.clientX + 'px',
            })
        ;
    }

    private loadingIndicatorCounter: number = 0;
    showLoadingIndicator(delay = 0) {
        this.loadingIndicatorCounter++
        setTimeout(() => {
            if(this.loadingIndicatorCounter > 0) {
                $('#mainLoadingIndicator').show();
            }
        }, delay);
    }
    hideLoadingIndicator() {
        this.loadingIndicatorCounter--;
        $('#mainLoadingIndicator').hide();
    }

    newColor(): string {
        const colorCounts = {};
        for(const color of this.colors) {
            colorCounts[color] = 0;
        }

        this.getCutouts().forEach((cutout) => {
            if(colorCounts.hasOwnProperty(cutout.color)) {
                colorCounts[cutout.color]++;
            }
        });

        let lowestCountColor = null;
        let lowestCount = null;
        for(const color in colorCounts) {
            if(lowestCount === null || colorCounts[color] < lowestCount) {
                lowestCount = colorCounts[color];
                lowestCountColor = color;
            }
        }

        return lowestCountColor;
    }

    addCutoutFromTemplate(cutoutTemplate: CutoutTemplate<any, any, any>): Promise<void> {
        return cutoutTemplate.makeCutout(this).then((cutout) => {
            const number = ++this.cutoutCounter;
            cutout.name = 'Mijn kaart ' + number;
            cutout.color = this.newColor();

            this.actionHistory.addAction(new AddCutoutAction(
                cutout,
                this,
                this.cutouts.length
            ));

            this.lastAddedCutoutTemplateId = cutoutTemplate.id;
        });
    }

    addCutout(): Promise<void> {
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

        return this.addCutoutFromTemplate(cutoutTemplate);
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
        newCutout.color = this.newColor();

        this.actionHistory.addAction(new AddCutoutAction(
            newCutout,
            this,
            this.cutouts.length
        ));
    }

}
