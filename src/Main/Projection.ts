import Coordinate from "../Coordinates/Coordinate";
import Wms, {WmsParams} from "../Util/Wms";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import CoordinateConverter from "../Util/CoordinateConverter";
import Cache from "../Util/Cache";
import {Point} from "../Util/Math";
import {jsPDF} from "jspdf";
import {Paper} from "../Util/Paper";

export default class Projection<C extends Coordinate> {

    private cutout: Cutout<any, C, any, any> = null;
    coordinateSystem: CoordinateSystem<C>;
    anchor: C;

    constructor(readonly wms: Wms, private scale: number) {
        this.coordinateSystem = this.wms.getCoordinateSystem();
    }

    attach(cutout: Cutout<any, C, any, any>) {
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

    getWmsUrl(coords: C[], params: WmsParams = {}) {
        return this.wms.mapUrl(Object.assign({}, params, {
            bbox: coords[3].getX() + ',' + coords[3].getY() + ',' + coords[1].getX() + ',' + coords[1].getY(),
        }));
    }

    projectToPdf(doc: jsPDF, paper: Paper, cache: Cache): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const scale = this.getScale();

            const tileSize = 1000000 / scale;

            const toPaperCoord = (c: C): Point => {
                const diffX = c.getX() - this.anchor.getX();
                const diffY = c.getY() - this.anchor.getY();

                return new Point(
                    this.cutout.options.margin_left + diffX / (scale / 1000),
                    paper.height - this.cutout.options.margin_bottom - diffY / (scale / 1000)
                );
            };

            const p = this.cutout.mapPolygonProjection;
            const minX = Math.floor(Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/1000)*1000;
            const maxX = Math.ceil(Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX())/1000)*1000;
            const minY = Math.floor(Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/1000)*1000;
            const maxY = Math.ceil(Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY())/1000)*1000;

            const promises: Promise<void>[] = [];
            for(let x=minX; x<maxX; x+= 1000) {
                for(let y=minY; y<maxY; y+= 1000) {
                    const imagePromise: Promise<HTMLImageElement> = this.downloadPrintImage(cache, [
                        this.coordinateSystem.make(x, y+1000),
                        this.coordinateSystem.make(x+1000, y+1000),
                        this.coordinateSystem.make(x+1000, y),
                        this.coordinateSystem.make(x, y),
                    ], {
                        width: '400',
                        height: '400',
                    });

                    const paperCoord = toPaperCoord(this.coordinateSystem.make(x, y+1000));

                    const addImagePromise = imagePromise.then((img) => {
                        doc.addImage(img, 'PNG', paperCoord.getX(), paperCoord.getY(), tileSize, tileSize);
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
