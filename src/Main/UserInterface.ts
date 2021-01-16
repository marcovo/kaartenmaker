import Map from "./Map";
import Cutout from "./Cutout";
import Container from "./Container";
const $ = require( 'jquery' );
import Vue from 'vue/dist/vue.esm.js';
import ActionHistory from "../ActionHistory/ActionHistory";
import AddCutoutAction from "../ActionHistory/AddCutoutAction";
import DeleteCutoutAction from "../ActionHistory/DeleteCutoutAction";
import CutoutTemplate from "./CutoutTemplate";
import Serializer from "./Serializer";
import Bookmarks from "./Bookmarks";
import {WGS84System} from "../Coordinates/WGS84";
import {copyInput} from "../Util/functions";
require('../Lib/LeafletDrag');

export default class UserInterface {

    private map: Map;
    private cutouts: Cutout<any, any, any>[] = [];
    private bookmarks: Bookmarks;

    private cutoutList: Vue;
    private cutoutTemplatesWrapper: Vue;
    private bookmarksWrapper: Vue;
    private coordinatePanelWrapper: Vue;
    private cutoutDropdownMenu: Vue;
    private actionHistoryButtons: Vue;
    private lastAddedCutoutTemplateId: number = null;

    private cutoutCounter = 0;

    readonly colors: string[];

    readonly actionHistory: ActionHistory;
    private listeners: Record<string, (() => void)[]> = {};

    static readonly LOCALSTORAGE_KEY_STATISTICS_PARTICIPATION = 'statistics_participation';

    constructor() {

        this.colors = ['blue', 'orange', 'green', 'fuchsia', 'lime', '#f33', '#ee0', 'aqua', 'black', 'maroon', 'navy', 'purple', 'teal', 'olive'];

        this.actionHistory = new ActionHistory();
        this.bookmarks = new Bookmarks(this);

        $(() => {
            this.onLoad();
        });

    }

    getMap(): Map {
        return this.map;
    }

    onLoad() {
        this.map = new Map('map-canvas');

        $('#addButton').on('click', () => {
            this.addCutout();
        });

        $('#shareButton').on('click', () => {
            this.displayShareModal((new Serializer()).createWorkspaceLink(this));
        });

        $('#shareUrlModalCopy').on('click', () => {
            copyInput('#shareUrlModalInput');
        });

        $('#clearCacheButton').on('click', () => {
            if(confirm('De buffer bevat gedownloade kaartstukken. Wil je deze legen?')) {
                this.showLoadingIndicator();
                Container.clearCaches().finally(() => {
                    this.hideLoadingIndicator();
                });
            }
        });

        $('#resetStorageButton').on('click', () => {
            if(confirm('Wil je alle opgeslagen werkruimtes, sjablonen en andere voorkeuren verwijderen?')) {
                this.showLoadingIndicator();
                Container.resetStorage();
                this.trigger('storage-reset');
                this.hideLoadingIndicator();
            }
        });

        $('#resetApplicationButton').on('click', () => {
            if(confirm('Wil je alle opgeslagen voorkeuren en buffers volledig verwijderen? Dit kan in sommige browsers even duren.')) {
                this.showLoadingIndicator();
                Container.resetApplication().finally(() => {
                    this.hideLoadingIndicator();
                });
            }
        });

        this.cutoutList = new Vue({
            el: '#cutoutList',
            data: {
                cutouts: this.cutouts,
            },
            methods: {
                toggleHidden: (cutout: Cutout<any, any, any>) => {
                    cutout.toggleVisibleOnMap(this.map);
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
                makeCutoutTemplate: (cutout: Cutout<any, any, any>) => {
                    this.makeCutoutTemplate(cutout);
                },
                shareCutout: (cutout: Cutout<any, any, any>) => {
                    this.displayShareModal((new Serializer()).createCutoutLink(cutout));
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

        $('#cutoutListMinimizer').on('click', () => {
            $('#cutoutListPane').addClass('minimized');
        });
        $('#cutoutListMaximizer').on('click', () => {
            $('#cutoutListPane').removeClass('minimized');
        });

        $('#participate_statistics').on('change', () => {
            this.setStatisticsParticipation(
                $('#participate_statistics').prop('checked')
            );
        });

        this.cutoutTemplatesWrapper = new Vue({
            el: '#cutoutTemplatesWrapper',
            data: {
                userInterface: this,
                newCutoutTemplate: null,
            },
        });

        this.bookmarksWrapper = new Vue({
            el: '#bookmarksWrapper',
            data: {
                bookmarks: this.bookmarks,
            },
        });

        this.coordinatePanelWrapper = new Vue({
            el: '#coordinatePanelWrapper',
            data: {
                userInterface: this,
                leafletConvertibleCoordinateSystem: new WGS84System(),
            },
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
                makeCutoutTemplate: (cutout: Cutout<any, any, any>) => {
                    this.makeCutoutTemplate(cutout);
                },
                shareCutout: (cutout: Cutout<any, any, any>) => {
                    this.displayShareModal((new Serializer()).createCutoutLink(cutout));
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

        const urlParams = new URLSearchParams(window.location.search);
        const urlWorkspace = urlParams.get('workspace');
        if(urlWorkspace !== null) {
            (new Serializer()).importFromLink(urlWorkspace, this);
        } else {
            this.addCutout(false).then(() => {
                if(this.actionHistory.getLength() === 1) {
                    this.actionHistory.clear();
                }
            });
        }
    }

    on(key: string, callback: () => void) {
        if(this.listeners[key] === undefined) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    trigger(key: string) {
        if(this.listeners[key] === undefined) {
            return;
        }

        for(const listener of this.listeners[key]) {
            listener();
        }
    }

    getStatisticsParticipation(): boolean|null {
        const choice = window.localStorage.getItem(UserInterface.LOCALSTORAGE_KEY_STATISTICS_PARTICIPATION);
        if(choice === '1') return true;
        if(choice === '0') return false;
        return null;
    }

    setStatisticsParticipation(choice: boolean) {
        window.localStorage.setItem(
            UserInterface.LOCALSTORAGE_KEY_STATISTICS_PARTICIPATION,
            choice ? '1' : '0'
        );

        $('#participate_statistics').prop('checked', choice);

        $.get('server.php', {
            request: 'participation',
            choice: choice ? '1' : '0',
        });
    }

    checkStatisticsParticipation(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const choice = this.getStatisticsParticipation();
            if(choice === null) {
                $('#statisticsParticipationsModal').modal('show');

                $('#statisticsParticipationsModalNo, #statisticsParticipationsModalYes').off('click');

                $('#statisticsParticipationsModalNo').on('click', () => {
                    this.setStatisticsParticipation(false);
                    $('#statisticsParticipationsModal').modal('hide');
                    resolve(false);
                });

                $('#statisticsParticipationsModalYes').on('click', () => {
                    this.setStatisticsParticipation(true);
                    $('#statisticsParticipationsModal').modal('hide');
                    resolve(true);
                });
            } else {
                resolve(choice);
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

    cutoutLoading(cutout: Cutout<any, any, any>, progress: number|null) {
        if(progress === null) {
            $('#cutout_' + cutout.id + '_loading').addClass('lds-dual-ring-hidden');
            $('#cutout_' + cutout.id + '_loading_progress').css({width: 0});
        } else {
            $('#cutout_' + cutout.id + '_loading').removeClass('lds-dual-ring-hidden');
            $('#cutout_' + cutout.id + '_loading_progress').css({width: (progress*100) + '%'});
        }
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

    displayShareModal(link: string) {
        $('#shareUrlModalInput').val(link);
        $('#shareUrlModal').modal('show');
    }

    addCutoutFromTemplate(cutoutTemplate: CutoutTemplate<any, any, any>, center: boolean = true): Promise<void> {
        return cutoutTemplate.makeCutout(this)
            .then((cutout) => {
                if(center) {
                    return cutout.moveToWindowCenter().then((success) => {
                        if(!success) {
                            alert('De toegevoegde kaart kon niet op een geldige plaats binnen het scherm worden geplaatst. De kaart is op een geldige positie geplaatst buiten het zichtbare scherm.');
                        }
                        return cutout;
                    });
                } else {
                    return Promise.resolve(cutout);
                }
            })
            .then((cutout) => {
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

    addCutout(center: boolean = true): Promise<void> {
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

        return this.addCutoutFromTemplate(cutoutTemplate, center);
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

    setFromUnserialize(cutouts: Cutout<any, any, any>[]) {
        this.actionHistory.clear();

        for(const cutout of this.cutouts) {
            cutout.removeFromMap(this.map);
        }
        this.cutouts.splice(0);

        for(const cutout of cutouts) {
            const shouldBeVisible = cutout.visibleOnMap;
            this.attachCutout(cutout, this.cutouts.length);
            if(!shouldBeVisible) {
                cutout.toggleVisibleOnMap(this.map, false);
            }
        }

        this.map.fitToCutouts(this.cutouts);
    }

    print(cutout: Cutout<any, any, any>): void {
        this.cutoutLoading(cutout, 0);

        const progressCallback = (evt) => {
            this.cutoutLoading(cutout, evt.done / evt.total);
        };

        cutout.print(progressCallback).catch((e) => {
            console.log(e);
            alert('Something went wrong while printing');
        }).finally(() => {
            this.cutoutLoading(cutout, null);
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

    makeCutoutTemplate(sourceCutout: Cutout<any, any, any>): void {
        this.cutoutTemplatesWrapper.newCutoutTemplate = sourceCutout.makeTemplate();
    }

}
