import Coordinate from "../Coordinates/Coordinate";
import Wms, {WmsParams} from "../Util/Wms";
import Cutout from "../Main/Cutout";
import Cache from "../Util/Cache";
import {Point} from "../Util/Math";
import {jsPDF} from "jspdf";
import {Paper} from "../Util/Paper";
import Container from "../Main/Container";
import Projection from "./Projection";
import MapImageProvider from "../Util/MapImageProvider";

const MM_PER_INCH = 25.4;

export default class WmsProjection<C extends Coordinate> extends Projection<C, Wms> {

    private dpi: number = 300;

    static createAndInitialize(wmsName: string, scale: number = null): Promise<WmsProjection<Coordinate>> {
        return new Promise<WmsProjection<Coordinate>>((resolve, reject) => {
            const projection = new WmsProjection(wmsName, scale);
            return projection.initialize().then(() => {
                resolve(projection);
            });
        });
    }

    constructor(wmsName: string, private scale: number = null) {
        super(Container.wms(wmsName));

        this.coordinateSystem = this.mapImageProvider.getCoordinateSystem();

        if(this.scale === null) {
            this.scale = this.mapImageProvider.getDefaultScale();
        }
    }

    initialize(): Promise<void> {
        return this.mapImageProvider.fetchCapabilities().then();
    }

    clone(): WmsProjection<C> {
        return new WmsProjection(
            this.mapImageProvider.name,
            this.getScale(),
        );
    }

    attach(cutout: Cutout<any, C, any>) {
        super.attach(cutout);

        // Preload capabilities upon attaching
        this.initialize();
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

    getDpi(): number {
        return this.dpi;
    }

    setDpi(newDpi: number) {
        this.dpi = newDpi;
    }

    getWmsUrl(coords: C[], params: WmsParams = {}) {
        return this.mapImageProvider.mapUrl(Object.assign({}, params, {
            bbox: coords[3].getX() + ',' + coords[3].getY() + ',' + coords[1].getX() + ',' + coords[1].getY(),
        }));
    }

    isWithinSuggestedScaleRange(): Promise<boolean> {
        // WMS 1.3.0, Section 7.2.4.6.9 Scale denominators:
        //   "(...), the common pixel size is defined to be 0,28 mm × 0,28 mm."
        // (http://portal.opengeospatial.org/files/?artifact_id=14416)

        return this.mapImageProvider.getSuggestedScaleRange().then((suggestedScaleRange) => {
            const ptPerMm = this.getDpi() / 25.4;

            const effectiveScale = this.getScale() / ptPerMm / 0.28;

            if(suggestedScaleRange.min !== null && effectiveScale < suggestedScaleRange.min) {
                return false;
            }

            if(suggestedScaleRange.max !== null && effectiveScale > suggestedScaleRange.max) {
                return false;
            }

            return true;
        });
    }

    projectToPdf(doc: jsPDF, paper: Paper, cache: Cache): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // real mm: mm in physical world
            // paper mm: mm on paper map
            // tile: one WMS image download
            // px: pixels in WMS tile download
            // unit: unit of measurement of projection coordinate system (e.g., meters)
            const scale = this.getScale();
            const dpi = this.getDpi();
            const realMmPerPaperMm = scale;

            const realMmPerUnit = 1000;
            const targetPxPerTile = 500;
            const paperMmPerUnit = realMmPerUnit / realMmPerPaperMm;

            const pxPerPaperMm = Math.ceil(dpi / MM_PER_INCH);
            const pxPerUnit = pxPerPaperMm * paperMmPerUnit;

            const targetUnitsPerTile = targetPxPerTile / pxPerUnit;
            const targetUnitsPerTileOrder = 10 ** Math.floor(Math.log10(targetUnitsPerTile));
            const unitsPerTile = Math.round(targetUnitsPerTile / targetUnitsPerTileOrder) * targetUnitsPerTileOrder;

            const pxPerTile = Math.round(pxPerUnit * unitsPerTile);
            const paperMmPerTile = pxPerTile / pxPerPaperMm;

            const toPaperCoord = this.paperCoordinateConversion();

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

                    const paperCoord = toPaperCoord.convert(new Point(x, y+unitsPerTile));

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
