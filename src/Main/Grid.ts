import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import {jsPDF} from "jspdf";
import {Point} from "../Util/Math";
import CoordinateConverter from "../Util/CoordinateConverter";

export default class Grid<C extends Coordinate> {

    private cutout: Cutout<any, any, any> = null;

    constructor(readonly coordinateSystem: CoordinateSystem<C>) {

    }

    attach(cutout: Cutout<any, any, any>) {
        if(this.cutout !== null) {
            throw new Error('Already attached');
        }

        this.cutout = cutout;
    }

    getPolygon(): C[] {
        const projectionPolygon = this.cutout.mapPolygonProjection;

        const gridPolygon = [];
        for(let i=0; i<projectionPolygon.length; i++) {
            gridPolygon.push(CoordinateConverter.convert(projectionPolygon[i], this.coordinateSystem));
        }

        return gridPolygon;
    }

    drawOnPdf(doc: jsPDF) {
        // real mm: mm in physical world
        // paper mm: mm on paper map
        // unit: unit of measurement of projection coordinate system (e.g., meters)
        const paper = this.cutout.getPaper();
        const scale = this.cutout.getProjection().getScale();
        const realMmPerPaperMm = scale;

        const realMmPerUnit = 1000;
        const paperMmPerUnit = realMmPerUnit / realMmPerPaperMm;

        // TODO: Generalize this function
        const toPaperCoord = (c: C): Point => {
            c = CoordinateConverter.convert(c, this.cutout.getProjection().coordinateSystem);

            const diffX = c.getX() - this.cutout.getProjection().anchor.getX();
            const diffY = c.getY() - this.cutout.getProjection().anchor.getY();

            return new Point(
                this.cutout.options.margin_left + diffX * paperMmPerUnit,
                paper.height - this.cutout.options.margin_bottom - diffY * paperMmPerUnit
            );
        };

        const p = this.getPolygon();
        const minX = Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
        const maxX = Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
        const minY = Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());
        const maxY = Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());

        const targetPaperMmPerLine = 40;
        const targetRealMmPerLine = realMmPerPaperMm * targetPaperMmPerLine;
        const targetRealMmPerLineOrder = 10 ** Math.round(Math.log10(targetRealMmPerLine));
        const realMmPerLine = Math.round(targetRealMmPerLine / targetRealMmPerLineOrder) * targetRealMmPerLineOrder;
        const unitsPerLine = realMmPerLine / realMmPerUnit;

        const minXFloor = Math.floor(minX / unitsPerLine) * unitsPerLine;
        const minYFloor = Math.floor(minY / unitsPerLine) * unitsPerLine;

        const coordinateSystem = this.coordinateSystem.rebase(p[0]);
        for(let x=minXFloor; x<maxX; x+= unitsPerLine) {
            for(let y=minYFloor; y<maxY; y+= unitsPerLine) {
                const from = toPaperCoord(coordinateSystem.make(x, y));
                const toX = toPaperCoord(coordinateSystem.make(x+unitsPerLine, y));
                const toY = toPaperCoord(coordinateSystem.make(x, y+unitsPerLine));
                doc.line(from.getX(), from.getY(), toX.getX(), toX.getY());
                doc.line(from.getX(), from.getY(), toY.getX(), toY.getY());
            }
        }
    }

}
