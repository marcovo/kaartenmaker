import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import {jsPDF} from "jspdf";
import {lineSegmentsIntersection, Point} from "../Util/Math";
import CoordinateConverter from "../Util/CoordinateConverter";
import ConversionComposition from "../Conversion/ConversionComposition";
import {Serialization} from "./Serializer";

export type EdgeIntersection<C extends Coordinate> = {
    paperCoord: Point,
    gridCoord: C,
};

export type GridSpec = {
    base_x: number,
    delta_x: number,
    base_y: number,
    delta_y: number,
};

export default class Grid<C extends Coordinate> {

    private cutout: Cutout<any, any, any> = null;

    private customGridSpec: GridSpec|null = null;

    constructor(readonly coordinateSystem: CoordinateSystem<C>) {

    }

    serialize(): Serialization {
        return {
            system: this.coordinateSystem.code,
            customGridSpec: this.customGridSpec,
        };
    }

    static unserialize(serialized: Serialization): Grid<Coordinate> {
        const newGrid = new Grid(CoordinateConverter.getCoordinateSystem(serialized.system));
        if(serialized.customGridSpec) {
            newGrid.customGridSpec = Object.assign({}, serialized.customGridSpec);
        }
        return newGrid;
    }

    clone(): Grid<C> {
        const newGrid = new Grid(this.coordinateSystem);
        if(this.customGridSpec !== null) {
            newGrid.customGridSpec = Object.assign({}, this.customGridSpec);
        }
        return newGrid;
    }

    attach(cutout: Cutout<any, any, any>) {
        if(this.cutout !== null) {
            throw new Error('Already attached');
        }

        this.cutout = cutout;
    }

    detach() {
        if(this.cutout === null) {
            throw new Error('Already detached');
        }

        this.cutout = null;
    }

    getPolygon(): C[] {
        const projectionPolygon = this.cutout.mapPolygonProjection;

        const gridPolygon = [];
        for(let i=0; i<projectionPolygon.length; i++) {
            gridPolygon.push(CoordinateConverter.convert(projectionPolygon[i], this.coordinateSystem));
        }

        return gridPolygon;
    }

    getCustomGridSpec(): GridSpec|null {
        return this.customGridSpec;
    }

    setCustomGridSpec(gridSpec: GridSpec|null): void {
        this.customGridSpec = gridSpec;
    }

    getGridSpec(): GridSpec {
        if(this.customGridSpec !== null) {
            return this.customGridSpec;
        }

        return this.computeGridSpec();
    }

    computeGridSpec(): GridSpec {
        const mipDrawnGrid = this.cutout.getProjection().getMipDrawnGrid();
        if(mipDrawnGrid !== null) {
            return Object.assign({}, mipDrawnGrid);
        }

        // real mm: mm in physical world
        // paper mm: mm on paper map
        // unit: unit of measurement of projection coordinate system (e.g., meters)
        const scale = this.cutout.getProjection().getScale();
        const realMmPerPaperMm = scale;

        const realMmPerUnit = 1000;

        const targetPaperMmPerLine = 40;
        const targetRealMmPerLine = realMmPerPaperMm * targetPaperMmPerLine;
        const targetRealMmPerLineOrder = 10 ** Math.floor(Math.log10(targetRealMmPerLine));
        const realMmPerLine = Math.round(targetRealMmPerLine / targetRealMmPerLineOrder) * targetRealMmPerLineOrder;
        const unitsPerLine = realMmPerLine / realMmPerUnit;

        return {
            base_x: 0,
            delta_x: unitsPerLine,
            base_y: 0,
            delta_y: unitsPerLine,
        }
    }

    drawOnPdf(doc: jsPDF): Record<string, EdgeIntersection<C>[]> {

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

        const gridSpec = this.getGridSpec();

        const minXFloor = Math.floor((minX - gridSpec.base_x) / gridSpec.delta_x) * gridSpec.delta_x + gridSpec.base_x;
        const minYFloor = Math.floor((minY - gridSpec.base_y) / gridSpec.delta_y) * gridSpec.delta_y + gridSpec.base_y;

        const edgeIntersections = {
            top: [],
            left: [],
            right: [],
            bottom: [],
        };

        const corners = {
            topLeft: new Point(this.cutout.options.margin_left, this.cutout.options.margin_top),
            topRight: new Point(this.cutout.getPaper().width - this.cutout.options.margin_right, this.cutout.options.margin_top),
            bottomLeft: new Point(this.cutout.options.margin_left, this.cutout.getPaper().height - this.cutout.options.margin_bottom),
            bottomRight: new Point(this.cutout.getPaper().width - this.cutout.options.margin_right, this.cutout.getPaper().height - this.cutout.options.margin_bottom),
        };

        const edges = {
            top: {from: corners.topLeft, to: corners.topRight},
            left: {from: corners.topLeft, to: corners.bottomLeft},
            right: {from: corners.topRight, to: corners.bottomRight},
            bottom: {from: corners.bottomLeft, to: corners.bottomRight},
        };

        doc.setLineWidth(0.1);
        for(let x=minXFloor; x<maxX; x+= gridSpec.delta_x) {
            for(let y=minYFloor; y<maxY; y+= gridSpec.delta_y) {
                const from = toPaperCoord.convert(coordinateSystem.make(x, y));
                const toX = toPaperCoord.convert(coordinateSystem.make(x+gridSpec.delta_x, y));
                const toY = toPaperCoord.convert(coordinateSystem.make(x, y+gridSpec.delta_y));
                if(this.cutout.options.draw_grid) {
                    doc.line(from.getX(), from.getY(), toX.getX(), toX.getY());
                    doc.line(from.getX(), from.getY(), toY.getX(), toY.getY());
                }

                // Register intersection points of grid with frame border
                let paperCoord;
                if(null !== (paperCoord = lineSegmentsIntersection({from: from, to: toY}, edges.top))) {
                    edgeIntersections.top.push(<EdgeIntersection<C>>{
                        paperCoord: paperCoord,
                        gridCoord: toPaperCoord.inverse(paperCoord),
                    });
                }
                if(null !== (paperCoord = lineSegmentsIntersection({from: from, to: toX}, edges.left))) {
                    edgeIntersections.left.push(<EdgeIntersection<C>>{
                        paperCoord: paperCoord,
                        gridCoord: toPaperCoord.inverse(paperCoord),
                    });
                }
                if(null !== (paperCoord = lineSegmentsIntersection({from: from, to: toX}, edges.right))) {
                    edgeIntersections.right.push(<EdgeIntersection<C>>{
                        paperCoord: paperCoord,
                        gridCoord: toPaperCoord.inverse(paperCoord),
                    });
                }
                if(null !== (paperCoord = lineSegmentsIntersection({from: from, to: toY}, edges.bottom))) {
                    edgeIntersections.bottom.push(<EdgeIntersection<C>>{
                        paperCoord: paperCoord,
                        gridCoord: toPaperCoord.inverse(paperCoord),
                    });
                }
            }
        }

        return edgeIntersections;
    }

}
