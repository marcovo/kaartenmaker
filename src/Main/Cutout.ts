import Coordinate from "../Coordinates/Coordinate";
import Conversion from "../Conversion/Conversion";
import {millimeter, Paper} from "../Util/Paper";
import DutchGrid from "../Coordinates/DutchGrid";
import * as L from 'leaflet';
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import {walkLine} from "../Util/Math";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import Map from "./Map";
import * as _ from "lodash";
import * as $ from "jquery";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import Projection from "./Projection";
import { jsPDF } from "jspdf";
import {Point} from "../Util/Math";
import {WmsParams} from "../Util/Wms";
import Cache from "../Util/Cache";
import UserInterface from "./UserInterface";

export type CutoutOptions = {
    margin_top: millimeter,
    margin_right: millimeter,
    margin_bottom: millimeter,
    margin_left: millimeter,
    display_coords_top: boolean,
    display_coords_right: boolean,
    display_coords_bottom: boolean,
    display_coords_left: boolean,
    rotate_y_coords: boolean,
    display_ticks: boolean,
    display_sub_ticks: boolean,
};

type Color = string;

export default class Cutout<
    UiMapCoordinate extends Coordinate & LeafletConvertibleCoordinate,
    ProjectionCoordinate extends Coordinate,
    GridCoordinate extends Coordinate,
    UiMapCoordinateSystem extends CoordinateSystem<UiMapCoordinate> & LeafletConvertibleCoordinateSystem<UiMapCoordinate>,
    ProjectionCoordinateSystem extends CoordinateSystem<ProjectionCoordinate>,
    GridCoordinateSystem extends CoordinateSystem<GridCoordinate>,
    > {
    readonly id: number;
    name: string;
    options: CutoutOptions;

    anchorUiMapCoordinate: UiMapCoordinate;
    anchorProjection: ProjectionCoordinate;

    uiMapCoordinateSystem: UiMapCoordinateSystem;
    projectionCoordinateSystem: ProjectionCoordinateSystem;
    gridCoordinateSystem: GridCoordinateSystem;

    conversionProjection: Conversion<UiMapCoordinate, ProjectionCoordinate>;
    conversionGrid: Conversion<UiMapCoordinate, GridCoordinate>;

    mapPolygonUi: UiMapCoordinate[];
    mapPolygonProjection: ProjectionCoordinate[];

    leafletPolygon: L.polygon;

    paper: Paper;
    color: Color;

    static readonly pointsOnEdge = 5;

    static defaultCutoutOptions: CutoutOptions = {
        margin_top: 10,
        margin_right: 10,
        margin_bottom: 10,
        margin_left: 10,
        display_coords_top: true,
        display_coords_right: true,
        display_coords_bottom: true,
        display_coords_left: true,
        rotate_y_coords: true,
        display_ticks: true,
        display_sub_ticks: true,
    };

    constructor(
        private userInterface: UserInterface,
        id: number,
        paper: Paper,
        anchorUiMap: UiMapCoordinate,
        uiMapCoordinateSystem: UiMapCoordinateSystem,
        projectionCoordinateSystem: ProjectionCoordinateSystem,
        gridCoordinateSystem: GridCoordinateSystem,
        conversionProjection: Conversion<UiMapCoordinate, ProjectionCoordinate>,
        conversionGrid: Conversion<UiMapCoordinate, GridCoordinate>,
        private projection: Projection<ProjectionCoordinate>
    ) {
        this.id = id;
        this.paper = paper;
        this.options = Object.assign({}, Cutout.defaultCutoutOptions);

        this.uiMapCoordinateSystem = uiMapCoordinateSystem;
        this.projectionCoordinateSystem = projectionCoordinateSystem;
        this.gridCoordinateSystem = gridCoordinateSystem;

        this.conversionProjection = conversionProjection;
        this.conversionGrid = conversionGrid;

        this.setAnchorUiMapCoordinate(anchorUiMap);
    }

    setAnchorUiMapCoordinate(c: UiMapCoordinate) {
        this.anchorUiMapCoordinate = c;
        this.anchorProjection = this.conversionProjection.convert(this.anchorUiMapCoordinate);
    }

    computeMapPolygon(anchorProjection: ProjectionCoordinate): ProjectionCoordinate[] {
        const width: millimeter = this.paper.width - this.options.margin_left - this.options.margin_right;
        const height: millimeter = this.paper.height - this.options.margin_top - this.options.margin_bottom;

        if(!(anchorProjection instanceof DutchGrid)) {
            // Only for dutch grid at the moment...
            throw new Error();
        }

        const scale = this.projection.getScale();
        const topRight = new DutchGrid(anchorProjection.x + width*scale/1000, anchorProjection.y);
        const bottomRight = new DutchGrid(anchorProjection.x + width*scale/1000, anchorProjection.y + height*scale/1000);
        const bottomLeft = new DutchGrid(anchorProjection.x, anchorProjection.y + height*scale/1000);

        return [
            anchorProjection,
            // @ts-ignore
            topRight,
            // @ts-ignore
            bottomRight,
            // @ts-ignore
            bottomLeft,
        ];
    }

    computeUiMapPolygon(mapPolygonProjection): UiMapCoordinate[] {
        const mapPolygonUi = [];

        for(let i=0; i<4; i++) {
            walkLine(
                this.projectionCoordinateSystem,
                mapPolygonProjection[i],
                mapPolygonProjection[(i+1) % 4],
                Cutout.pointsOnEdge,
                (c: ProjectionCoordinate, step): void => {
                    if(step < Cutout.pointsOnEdge-1) {
                        mapPolygonUi.push(this.conversionProjection.inverse(c));
                    }
                }
            );
        }
        return mapPolygonUi;
    }

    determineUiMapPolygon(): void {
        this.mapPolygonProjection = this.computeMapPolygon(this.anchorProjection);

        this.mapPolygonUi = this.computeUiMapPolygon(this.mapPolygonProjection);
    }

    addToMap(map: Map) {
        this.determineUiMapPolygon();

        const coords = _.map(this.mapPolygonUi, (c: UiMapCoordinate): L.LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon = L.polygon(coords, {color: this.color, weight: 3, draggable: true});

        this.leafletPolygon.addTo(map.getLeafletMap());
        this.leafletPolygon.dragging.enable();

        this.leafletPolygon.on('prelatlng', (evt) => {
            const thisCornerLL = this.conversionProjection.convert(evt.latlngs[0]);
            const thisCornerHH = this.conversionProjection.convert(evt.latlngs[(Cutout.pointsOnEdge - 1) * 2]);
            const thisLeft = thisCornerLL.getX();
            const thisRight = thisCornerHH.getX();
            const thisBottom = thisCornerLL.getY();
            const thisTop = thisCornerHH.getY();

            const factor = Math.pow(2,map.getLeafletMap().getZoom()-12);
            let diffX = 1000/factor;
            let diffY = 1000/factor;
            let maxDiffPerpHor = (thisRight - thisLeft)/2;
            let maxDiffPerpVer = (thisTop - thisBottom)/2;

            let newCornerX = null;
            let newCornerY = null;

            this.userInterface.getCutouts().forEach((cutout) => {
                if(cutout.id === this.id) {
                    return;
                }

                const otherLeft = cutout.mapPolygonProjection[0].getX();
                const otherRight = cutout.mapPolygonProjection[2].getX();
                const otherBottom = cutout.mapPolygonProjection[0].getY();
                const otherTop = cutout.mapPolygonProjection[2].getY();

                // Opposite-edge diffs ('outer')
                const outDiffTop = Math.abs(otherBottom - thisTop);
                const outDiffBottom = Math.abs(otherTop - thisBottom);
                const outDiffLeft = Math.abs(otherRight - thisLeft);
                const outDiffRight = Math.abs(otherLeft - thisRight);

                // Same-edge diffs ('inner')
                const inDiffTop = Math.abs(otherTop - thisTop);
                const inDiffBottom = Math.abs(otherBottom - thisBottom);
                const inDiffLeft = Math.abs(otherLeft - thisLeft);
                const inDiffRight = Math.abs(otherRight - thisRight);

                const minDiffVer = Math.min(outDiffTop, outDiffBottom, inDiffTop, inDiffBottom);
                const minDiffHor = Math.min(outDiffLeft, outDiffRight, inDiffLeft, inDiffRight);

                if(minDiffHor < maxDiffPerpHor) {
                    if(outDiffTop < diffY) {
                        newCornerY = otherBottom - (thisTop - thisBottom);
                        diffY = outDiffTop;
                    }
                    if(outDiffBottom < diffY) {
                        newCornerY = otherTop;
                        diffY = outDiffBottom;
                    }
                    if(inDiffTop < diffY) {
                        newCornerY = otherTop - (thisTop - thisBottom);
                        diffY = inDiffTop;
                    }
                    if(inDiffBottom < diffY) {
                        newCornerY = otherBottom;
                        diffY = inDiffBottom;
                    }
                }

                if(minDiffVer < maxDiffPerpVer) {
                    if(outDiffLeft < diffX) {
                        newCornerX = otherRight;
                        diffX = outDiffLeft;
                    }
                    if(outDiffRight < diffX) {
                        newCornerX = otherLeft - (thisRight - thisLeft);
                        diffX = outDiffRight;
                    }
                    if(inDiffLeft < diffX) {
                        newCornerX = otherLeft;
                        diffX = inDiffLeft;
                    }
                    if(inDiffRight < diffX) {
                        newCornerX = otherRight - (thisRight - thisLeft);
                        diffX = inDiffRight;
                    }
                }
            });

            if(newCornerX || newCornerY) {
                newCornerX = newCornerX || thisLeft;
                newCornerY = newCornerY || thisBottom;

                const newCorner = this.projectionCoordinateSystem.make(newCornerX, newCornerY);

                const newPolygon = this.computeUiMapPolygon(this.computeMapPolygon(newCorner));

                const newLeafletPolygon = _.map(newPolygon, (c: UiMapCoordinate): L.LatLng => {
                    return c.toLeaflet();
                });

                evt.latlngs.splice(0, evt.latlngs.length, ...newLeafletPolygon);
            }
        });

        // Events
        this.leafletPolygon.on('mouseover', () => {
            this.mouseover();
        });

        this.leafletPolygon.on('mouseout', () => {
            this.mouseout();
        });

        this.leafletPolygon.on('dragend', () => {
            this.setAnchorUiMapCoordinate(this.leafletPolygon.getLatLngs()[0][0]);
            this.updateMap();
        });

        this.mouseout();
    }

    removeFromMap(map: Map) {
        if(this.leafletPolygon !== null) {
            map.getLeafletMap().removeLayer(this.leafletPolygon);
        }
    }

    updateMap() {
        this.determineUiMapPolygon();

        const coords = _.map(this.mapPolygonUi, (c: UiMapCoordinate): L.LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon.setLatLngs(coords);
    }

    print(cache: Cache): Promise<void> {
        const scale = this.projection.getScale();

        const tileSize = 1000000 / scale;

        const toPaperCoord = (c: ProjectionCoordinate): Point => {
            const diffX = c.getX() - this.anchorProjection.getX();
            const diffY = c.getY() - this.anchorProjection.getY();

            return new Point(
                this.options.margin_left + diffX / (scale / 1000),
                this.paper.height - this.options.margin_bottom - diffY / (scale / 1000)
            );
        };

        const doc = new jsPDF({
            orientation: (this.paper.width >= this.paper.height) ? 'landscape' : 'portrait',
            format: [this.paper.width, this.paper.height],
        });

        const p = this.mapPolygonProjection;
        const minX = Math.floor(Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/1000)*1000;
        const maxX = Math.ceil(Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/1000)*1000;
        const minY = Math.floor(Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/1000)*1000;
        const maxY = Math.ceil(Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/1000)*1000;

        const promises: Promise<HTMLImageElement>[] = [];
        for(let x=minX; x<maxX; x+= 1000) {
            for(let y=minY; y<maxY; y+= 1000) {
                const imagePromise: Promise<HTMLImageElement> = this.downloadPrintImage(cache, [
                    this.projectionCoordinateSystem.make(x, y+1000),
                    this.projectionCoordinateSystem.make(x+1000, y+1000),
                    this.projectionCoordinateSystem.make(x+1000, y),
                    this.projectionCoordinateSystem.make(x, y),
                ], {
                    width: '400',
                    height: '400',
                });

                const paperCoord = toPaperCoord(this.projectionCoordinateSystem.make(x, y+1000));

                imagePromise.then((img) => {
                    doc.addImage(img, 'PNG', paperCoord.getX(), paperCoord.getY(), tileSize, tileSize);
                })

                promises.push(imagePromise);
            }
        }

        return Promise.all(promises).then(() => {
            const diffs = (coords: [number, number][]): [number, number][] => {
                const res = [];
                for(let i=0; i<coords.length-1; i++) {
                    res.push([coords[i+1][0] - coords[i][0], coords[i+1][1] - coords[i][1]]);
                }
                return res;
            };

            doc.setFillColor(255, 255, 255);

            const paperCoordTopLeft = toPaperCoord(this.mapPolygonProjection[3]);
            const paperCoordTopRight = toPaperCoord(this.mapPolygonProjection[2]);
            const paperCoordBottomRight = toPaperCoord(this.mapPolygonProjection[1]);
            const paperCoordBottomLeft = toPaperCoord(this.mapPolygonProjection[0]);

            doc.lines(
                diffs([
                    [paperCoordTopLeft.getX(), paperCoordTopLeft.getY()],
                    [paperCoordTopRight.getX(), paperCoordTopRight.getY()],
                    [this.paper.width, paperCoordTopRight.getY()],
                    [this.paper.width, 0],
                    [0, 0],
                    [0, paperCoordTopLeft.getY()],
                    [paperCoordTopLeft.getX(), paperCoordTopLeft.getY()],
                ]),
                paperCoordTopLeft.getX(),
                paperCoordTopLeft.getY(),
                null,
                'F',
                true
            );

            doc.lines(
                diffs([
                    [paperCoordTopRight.getX(), paperCoordTopRight.getY()],
                    [paperCoordBottomRight.getX(), paperCoordBottomRight.getY()],
                    [paperCoordBottomRight.getX(), this.paper.height],
                    [this.paper.width, this.paper.height],
                    [this.paper.width, 0],
                    [paperCoordTopRight.getX(), 0],
                    [paperCoordTopRight.getX(), paperCoordTopRight.getY()],
                ]),
                paperCoordTopRight.getX(),
                paperCoordTopRight.getY(),
                null,
                'F',
                true
            );

            doc.lines(
                diffs([
                    [paperCoordBottomRight.getX(), paperCoordBottomRight.getY()],
                    [paperCoordBottomLeft.getX(), paperCoordBottomLeft.getY()],
                    [0, paperCoordBottomLeft.getY()],
                    [0, this.paper.height],
                    [this.paper.width, this.paper.height],
                    [this.paper.width, paperCoordBottomRight.getY()],
                    [paperCoordBottomRight.getX(), paperCoordBottomRight.getY()],
                ]),
                paperCoordBottomRight.getX(),
                paperCoordBottomRight.getY(),
                null,
                'F',
                true
            );

            doc.lines(
                diffs([
                    [paperCoordBottomLeft.getX(), paperCoordBottomLeft.getY()],
                    [paperCoordTopLeft.getX(), paperCoordTopLeft.getY()],
                    [paperCoordTopLeft.getX(), 0],
                    [0, 0],
                    [0, this.paper.height],
                    [paperCoordBottomLeft.getX(), this.paper.height],
                    [paperCoordBottomLeft.getX(), paperCoordBottomLeft.getY()],
                ]),
                paperCoordBottomLeft.getX(),
                paperCoordBottomLeft.getY(),
                null,
                'F',
                true
            );

            doc.save("a4.pdf");
        });
    }

    private downloadPrintImage(cache: Cache, coords: ProjectionCoordinate[], params: WmsParams = {}): Promise<HTMLImageElement> {
        const url = this.projection.getWmsUrl(coords, params);

        return cache.fetch(url, () => {
            return new Promise((resolve, reject) => {

                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'blob';
                xhr.onload = function (e) {
                    const blob = xhr.response;

                    const fr = new FileReader();
                    fr.onload = function(e) {
                        // @ts-ignore
                        resolve(fr.result);
                    };
                    fr.readAsDataURL(blob);
                };
                xhr.send(null);
            });
        }).then((result) => {
            return new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.src = result;
                img.onload = function () {
                    resolve(img);
                };
            });
        });
    }

    mouseover() {
        this.leafletPolygon.setStyle({weight: 5, opacity: 0.7, fillOpacity: 0.3});
        $('#cutout_' + this.id).addClass('bg-gray-100');
    };

    mouseout() {
        this.leafletPolygon.setStyle({weight: 3, opacity: 0.5, fillOpacity: 0.2});
        $('#cutout_' + this.id).removeClass('bg-gray-100');
    };


}
