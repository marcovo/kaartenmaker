import Coordinate from "../Coordinates/Coordinate";
import Wms, {WmsParams} from "../Util/Wms";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import CoordinateConverter from "../Util/CoordinateConverter";
import Cache from "../Util/Cache";
import {Point} from "../Util/Math";
import {jsPDF} from "jspdf";
import {Paper} from "../Util/Paper";
import Container from "./Container";

const MM_PER_INCH = 25.4;

export default class Projection<C extends Coordinate> {

    readonly wms: Wms;
    private cutout: Cutout<any, C, any> = null;
    coordinateSystem: CoordinateSystem<C>;
    anchor: C;

    constructor(wmsName: string, private scale: number = null) {
        this.wms = Container.wms(wmsName);
        this.coordinateSystem = this.wms.getCoordinateSystem();

        if(this.scale === null) {
            this.scale = this.wms.getDefaultScale();
        }
    }

    detach() {
        if(this.cutout === null) {
            throw new Error('Already detached');
        }

        this.cutout = null;
    }

    attach(cutout: Cutout<any, C, any>) {
        if(this.cutout !== null) {
            throw new Error('Already attached');
        }

        this.cutout = cutout;
    }

    setAnchor(coordinate: Coordinate) {
        this.anchor = CoordinateConverter.convert(coordinate, this.coordinateSystem);
        this.coordinateSystem = this.coordinateSystem.rebase(this.anchor);
    }

    getScale(): number {
        return this.scale;
    }

    setScale(newScale: number) {
        this.scale = newScale;
        if(this.cutout) {
            this.cutout.updateMap();
        }
    }

    getWmsUrl(coords: C[], params: WmsParams = {}) {
        return this.wms.mapUrl(Object.assign({}, params, {
            bbox: coords[3].getX() + ',' + coords[3].getY() + ',' + coords[1].getX() + ',' + coords[1].getY(),
        }));
    }

    projectToPdf(doc: jsPDF, paper: Paper, cache: Cache): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // real mm: mm in physical world
            // paper mm: mm on paper map
            // tile: one WMS image download
            // px: pixels in WMS tile download
            // unit: unit of measurement of projection coordinate system (e.g., meters)
            const scale = this.getScale();
            const realMmPerPaperMm = scale;

            const realMmPerUnit = 1000;
            const targetPxPerTile = 500;
            const dpi = 254;

            const pxPerPaperMm = Math.ceil(dpi / MM_PER_INCH);
            const pxPerUnit = pxPerPaperMm / realMmPerPaperMm * realMmPerUnit;

            const targetUnitsPerTile = targetPxPerTile / pxPerUnit;
            const targetUnitsPerTileOrder = 10 ** Math.round(Math.log10(targetUnitsPerTile));
            const unitsPerTile = Math.round(targetUnitsPerTile / targetUnitsPerTileOrder) * targetUnitsPerTileOrder;

            const pxPerTile = Math.round(pxPerUnit * unitsPerTile);
            const paperMmPerTile = pxPerTile / pxPerPaperMm;

            // TODO: Generalize this function
            const toPaperCoord = (c: C): Point => {
                const diffX = c.getX() - this.anchor.getX();
                const diffY = c.getY() - this.anchor.getY();

                return new Point(
                    this.cutout.options.margin_left + diffX / (scale / realMmPerUnit),
                    paper.height - this.cutout.options.margin_bottom - diffY / (scale / realMmPerUnit)
                );
            };

            const p = this.cutout.mapPolygonProjection;
            const minX = Math.floor(Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/unitsPerTile)*unitsPerTile;
            const maxX = Math.ceil(Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/unitsPerTile)*unitsPerTile;
            const minY = Math.floor(Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/unitsPerTile)*unitsPerTile;
            const maxY = Math.ceil(Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/unitsPerTile)*unitsPerTile;

            const promises: Promise<void>[] = [];
            for(let x=minX; x<maxX; x+= unitsPerTile) {
                for(let y=minY; y<maxY; y+= unitsPerTile) {
                    const imagePromise: Promise<HTMLImageElement> = this.downloadPrintImage(cache, [
                        this.coordinateSystem.make(x, y+unitsPerTile),
                        this.coordinateSystem.make(x+unitsPerTile, y+unitsPerTile),
                        this.coordinateSystem.make(x+unitsPerTile, y),
                        this.coordinateSystem.make(x, y),
                    ], {
                        width: pxPerTile.toString(),
                        height: pxPerTile.toString(),
                    });

                    const paperCoord = toPaperCoord(this.coordinateSystem.make(x, y+unitsPerTile));

                    const addImagePromise = imagePromise.then((img) => {
                        doc.addImage(img, 'PNG', paperCoord.getX(), paperCoord.getY(), paperMmPerTile, paperMmPerTile);
                    })

                    promises.push(addImagePromise);
                }
            }

            return Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    private downloadPrintImage(cache: Cache, coords: C[], params: WmsParams = {}): Promise<HTMLImageElement> {
        const url = this.getWmsUrl(coords, params);

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

}
