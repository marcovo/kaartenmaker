import {Paper} from "../Util/Paper";
import { jsPDF } from "jspdf";
import {Point} from "../Util/Math";
import Cache from "../Util/Cache";
import Cutout from "./Cutout";
import Container from "./Container";

export default class Printer {

    private paper: Paper;

    constructor(private cutout: Cutout<any, any, any>) {
        this.paper = this.cutout.getPaper();
    }

    print(): Promise<void> {
        return Container.getCache().then((cache) => {
            return this.buildAndPrint(cache).then(() => {
                return cache.clean();
            });
        });
    }

    private buildAndPrint(cache: Cache): Promise<void> {

        const doc = new jsPDF({
            orientation: (this.paper.width >= this.paper.height) ? 'landscape' : 'portrait',
            format: [this.paper.width, this.paper.height],
        });

        return this.cutout.getProjection().projectToPdf(doc, this.paper, cache).then(() => {

            const edgeIntersections = this.cutout.getGrid().drawOnPdf(doc);

            this.drawFrameBackground(doc);

            for(const intersection of edgeIntersections.left) {
                doc.text(
                    intersection.gridCoord.getY().toString(),
                    intersection.paperCoord.getX(),
                    intersection.paperCoord.getY(),
                );
            }

            doc.save("a4.pdf");
        });
    }

    private drawFrameBackground(doc: jsPDF) {
        const toPaperCoord = this.cutout.getProjection().paperCoordinateConversion();

        const diffs = (coords: [number, number][]): [number, number][] => {
            const res = [];
            for(let i=0; i<coords.length-1; i++) {
                res.push([coords[i+1][0] - coords[i][0], coords[i+1][1] - coords[i][1]]);
            }
            return res;
        };

        doc.setFillColor(255, 255, 255);

        const paperCoordTopLeft = toPaperCoord.convert(Point.from(this.cutout.mapPolygonProjection[3]));
        const paperCoordTopRight = toPaperCoord.convert(Point.from(this.cutout.mapPolygonProjection[2]));
        const paperCoordBottomRight = toPaperCoord.convert(Point.from(this.cutout.mapPolygonProjection[1]));
        const paperCoordBottomLeft = toPaperCoord.convert(Point.from(this.cutout.mapPolygonProjection[0]));

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
    }

}
