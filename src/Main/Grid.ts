import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import {jsPDF} from "jspdf";
import {Point} from "../Util/Math";
import CoordinateConverter from "../Util/CoordinateConverter";
import ConversionComposition from "../Conversion/ConversionComposition";

export type EdgeIntersection<C extends Coordinate> = {
    paperCoord: Point,
    gridCoord: C,
};

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

    drawOnPdf(doc: jsPDF): Record<string, EdgeIntersection<C>[]> {
        // real mm: mm in physical world
        // paper mm: mm on paper map
        // unit: unit of measurement of projection coordinate system (e.g., meters)
        const scale = this.cutout.getProjection().getScale();
        const realMmPerPaperMm = scale;

        const realMmPerUnit = 1000;

        const p = this.getPolygon();
        const minX = Math.min(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
        const maxX = Math.max(p[0].getX(), p[1].getX(), p[2].getX(), p[3].getX());
        const minY = Math.min(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());
        const maxY = Math.max(p[0].getY(), p[1].getY(), p[2].getY(), p[3].getY());

        const coordinateSystem = this.coordinateSystem.rebase(p[0]);
        const toPaperCoord = new ConversionComposition(
            CoordinateConverter.conversion(coordinateSystem, this.cutout.getProjection().coordinateSystem),
            this.cutout.getProjection().paperCoordinateConversion()
        );

        const targetPaperMmPerLine = 40;
        const targetRealMmPerLine = realMmPerPaperMm * targetPaperMmPerLine;
        const targetRealMmPerLineOrder = 10 ** Math.round(Math.log10(targetRealMmPerLine));
        const realMmPerLine = Math.round(targetRealMmPerLine / targetRealMmPerLineOrder) * targetRealMmPerLineOrder;
        const unitsPerLine = realMmPerLine / realMmPerUnit;

        const minXFloor = Math.floor(minX / unitsPerLine) * unitsPerLine;
        const minYFloor = Math.floor(minY / unitsPerLine) * unitsPerLine;

        const edgeIntersections = {
            top: [],
            left: [],
            right: [],
            bottom: [],
        };

        doc.setLineWidth(0.1);
        for(let x=minXFloor; x<maxX; x+= unitsPerLine) {
            for(let y=minYFloor; y<maxY; y+= unitsPerLine) {
                const from = toPaperCoord.convert(coordinateSystem.make(x, y));
                const toX = toPaperCoord.convert(coordinateSystem.make(x+unitsPerLine, y));
                const toY = toPaperCoord.convert(coordinateSystem.make(x, y+unitsPerLine));
                doc.line(from.getX(), from.getY(), toX.getX(), toX.getY());
                doc.line(from.getX(), from.getY(), toY.getX(), toY.getY());

                if(from.getX() < this.cutout.options.margin_left && toX.getX() > this.cutout.options.margin_left) {
                    const paperCoord = new Point(
                        this.cutout.options.margin_left,
                        from.getY() + (this.cutout.options.margin_left - from.getX()) / (toX.getX() - from.getX()) * (toX.getY() - from.getY()),
                    );
                    edgeIntersections.left.push(<EdgeIntersection<C>>{
                        paperCoord: paperCoord,
                        gridCoord: toPaperCoord.inverse(paperCoord),
                    });
                }
            }
        }

        return edgeIntersections;
    }

}
