import Coordinate from "../Coordinates/Coordinate";
import Wmts, {WmtsParams} from "./Wmts";
import Cutout from "../Main/Cutout";
import Cache from "../Util/Cache";
import {Point} from "../Util/Math";
import {jsPDF} from "jspdf";
import Paper from "../Util/Paper";
import Container from "../Main/Container";
import Projection from "./Projection";
import {Serialization} from "../Main/Serializer";
import {GridSpec} from "../Main/Grid";

const MM_PER_INCH = 25.4;

export default class WmtsProjection<C extends Coordinate> extends Projection<C, Wmts> {

    static createAndInitialize(wmtsName: string, scale: number = null, tileMatrix: string = null): Promise<WmtsProjection<Coordinate>> {
        return new Promise<WmtsProjection<Coordinate>>((resolve, reject) => {
            const projection = new WmtsProjection(wmtsName, scale, tileMatrix);
            return projection.initialize().then(() => {
                resolve(projection);
            });
        });
    }

    constructor(wmtsName: string, scale: number = null, private tileMatrixId: string = null) {
        super(Container.wmts(wmtsName), scale);

        this.coordinateSystem = this.mapImageProvider.getCoordinateSystem();
    }

    initialize(): Promise<void> {
        return this.mapImageProvider.fetchCapabilities().then(() => {
            if(this.scale === null && this.tileMatrixId === null) {
                this.scale = 25000;
            }

            if(this.tileMatrixId === null) {
                this.tileMatrixId = this.mapImageProvider.getTileMatrixClosestToScale(this.scale);
            }

            if(this.scale === null) {
                this.scale = this.mapImageProvider.getTileMatrix(this.tileMatrixId).scaleDenominator;
            }
        });
    }

    clone(): WmtsProjection<C> {
        return new WmtsProjection(
            this.mapImageProvider.name,
            this.getScale(),
            this.getTileMatrixId(),
        );
    }

    serialize(): Serialization {
        return {
            type: 'wmts',
            mip: this.mapImageProvider.name,
            scale: this.scale,
            tileMatrixId: this.tileMatrixId,
        };
    }

    static unserialize(serialized: Serialization): WmtsProjection<Coordinate> {
        const projection = new WmtsProjection(serialized.mip, serialized.scale);
        if(serialized.tileMatrixId) {
            projection.setTileMatrixId(serialized.tileMatrixId);
        }
        return projection;
    }

    attach(cutout: Cutout<any, C, any>) {
        super.attach(cutout);

        // Preload capabilities upon attaching
        this.initialize();
    }

    getMipDrawnGrid(): GridSpec | null {
        return this.mapImageProvider.getDrawnGrid(this.tileMatrixId);
    }

    getTileMatrixId(): string {
        return this.tileMatrixId;
    }

    setTileMatrixId(newTileMatrix: string) {
        this.tileMatrixId = newTileMatrix;
        if(this.cutout) {
            this.cutout.updateMap();
        }
    }

    getDpi(): number {
        const realMmPerPaperMm = this.getScale();
        const tileMatrix = this.mapImageProvider.getTileMatrix(this.getTileMatrixId());

        // Conversion formula according to WMTS spec 1.0.0, section 6.1
        // For now, we assume that CRS units === meters, so metersPerUnit(crs) === 1
        const pixelSpan = tileMatrix.scaleDenominator * 0.00028;

        const realMmPerPx = pixelSpan * 1000;
        const pxPerPaperMm = realMmPerPaperMm / realMmPerPx;

        return pxPerPaperMm * MM_PER_INCH;
    }

    projectToPdf(doc: jsPDF, paper: Paper, cache: Cache, progressCallback: ((evt) => void)|null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // real mm: mm in physical world
            // paper mm: mm on paper map
            // tile: one WMTS image download
            // unit: unit of measurement of projection coordinate system (e.g., meters)
            const scale = this.getScale();
            const realMmPerPaperMm = scale;
            const tileMatrix = this.mapImageProvider.getTileMatrix(this.getTileMatrixId());

            // Conversion formula according to WMTS spec 1.0.0, section 6.1
            // For now, we assume that CRS units === meters, so metersPerUnit(crs) === 1
            const pixelSpan = tileMatrix.scaleDenominator * 0.00028;

            const tileSpanX = tileMatrix.tileWidth * pixelSpan; // 'real m' width of a tile
            const tileSpanY = tileMatrix.tileHeight * pixelSpan;

            const tileMatrixMinX = tileMatrix.topLeftCorner[0];
            const tileMatrixMaxY = tileMatrix.topLeftCorner[1];
            const tileMatrixMaxX = tileMatrixMinX + tileSpanX * tileMatrix.matrixWidth;
            const tileMatrixMinY = tileMatrixMaxY - tileSpanY * tileMatrix.matrixHeight;


            const paperMmPerTile = tileSpanX /* real m per tile */ * 1000 / realMmPerPaperMm;
            const toPaperCoord = this.paperCoordinateConversion();


            const p = this.cutout.mapPolygonProjection;
            const minX = Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
            const maxX = Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
            const minY = Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());
            const maxY = Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());

            const colMin = Math.floor((minX - tileMatrixMinX) / tileSpanX);
            const colMax = Math.ceil((maxX - tileMatrixMinX) / tileSpanX);
            const rowMax = Math.ceil((tileMatrixMaxY - minY) / tileSpanY);
            const rowMin = Math.floor((tileMatrixMaxY - maxY) / tileSpanY);

            const promises: Promise<void>[] = [];
            let done = 0;
            for(let col = colMin; col < colMax; col++) {
                for(let row = rowMin; row < rowMax; row++) {
                    const imagePromise: Promise<HTMLImageElement> = this.downloadPrintImage(cache, {
                        tilematrix: this.getTileMatrixId(),
                        tilecol: col.toString(),
                        tilerow: row.toString(),
                    });

                    const paperCoord = toPaperCoord.convert(new Point(
                        tileMatrixMinX + tileSpanX * col,
                        tileMatrixMaxY - tileSpanY * row,
                    ));

                    const addImagePromise = imagePromise.then((img) => {
                        doc.addImage(img, 'PNG', paperCoord.getX(), paperCoord.getY(), paperMmPerTile, paperMmPerTile);

                        done++;
                        if(progressCallback) {
                            progressCallback({
                                done: done,
                                total: promises.length,
                            })
                        }
                    })

                    promises.push(addImagePromise);
                }
            }

            return Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    private downloadPrintImage(cache: Cache, params: WmtsParams = {}): Promise<HTMLImageElement> {
        const url = this.mapImageProvider.getTile(Object.assign({}, params));

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
