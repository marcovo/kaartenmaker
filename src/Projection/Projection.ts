import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "../Main/Cutout";
import CoordinateConverter from "../Util/CoordinateConverter";
import Cache from "../Util/Cache";
import {Point, PointSystem} from "../Util/Math";
import {jsPDF} from "jspdf";
import Paper from "../Util/Paper";
import CartesianTransformation from "../Conversion/CartesianTransformation";
import MapImageProvider from "../Util/MapImageProvider";

export default abstract class Projection<C extends Coordinate, MIP extends MapImageProvider> {

    protected cutout: Cutout<any, C, any> = null;
    coordinateSystem: CoordinateSystem<C>;
    anchor: C;

    protected constructor(readonly mapImageProvider: MIP, protected scale: number = null) {
    }

    abstract clone(): Projection<C, MIP>;

    abstract initialize(): Promise<void>;

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

    getMapImageProvider(): MapImageProvider {
        return this.mapImageProvider;
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

    abstract getDpi();

    paperCoordinateConversion(): CartesianTransformation<Point> {
        const realMmPerPaperMm = this.getScale();
        const realMmPerUnit = 1000;
        const paperMmPerUnit = realMmPerUnit / realMmPerPaperMm;

        return CartesianTransformation
            .build(new PointSystem())

            // Incoming is a projection coordinate; we move the anchor to the origin
            .translate(new Point(-this.anchor.getX(), -this.anchor.getY()))

            // We scale from real distances to paper distances
            .scale(paperMmPerUnit)

            // On paper, the y-axis points down
            .mulMatrix([[1, 0], [0, -1]])

            // Move by margin
            .translate(new Point(
                this.cutout.options.margin_left,
                this.cutout.getPaper().height - this.cutout.options.margin_bottom
            ))

            .make();
    }

    abstract projectToPdf(doc: jsPDF, paper: Paper, cache: Cache);
}
