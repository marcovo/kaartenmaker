import Paper from "../Util/Paper";
import {jsPDF, TextOptionsLight} from "jspdf";
import {Point} from "../Util/Math";
import Cache from "../Util/Cache";
import Cutout from "./Cutout";
import Container from "./Container";
import {EdgeIntersection} from "./Grid";
import Coordinate from "../Coordinates/Coordinate";
import {formatCm, formatMeters} from "../Util/functions";

export type PdfCoordinateDrawSide = 'top' | 'left' | 'right' | 'bottom';
type DrawBox = {top: number, bottom: number, left: number, right: number};

export class JsPdfGenerator {
    private jsPdf: jsPDF|null = null;

    public addPage(paper: Paper): jsPDF {
        if(this.jsPdf === null) {
            this.jsPdf = new jsPDF({
                orientation: (paper.width >= paper.height) ? 'landscape' : 'portrait',
                format: [paper.width, paper.height],
            });
        } else {
            this.jsPdf.addPage(
                [paper.width, paper.height],
                (paper.width >= paper.height) ? 'landscape' : 'portrait'
            );
        }
        return this.jsPdf;
    }

    public getJsPdf(): jsPDF {
        return this.jsPdf;
    }
}

export default class Printer {

    private paper: Paper;

    private drawnBoxes: DrawBox[] = [];

    constructor(private cutout: Cutout<any, any, any>, private progressCallback: ((evt) => void)|null = null) {
        this.paper = this.cutout.getPaper();
    }

    private requestDrawBox(drawBox: DrawBox): boolean {
        for(const d of this.drawnBoxes) {
            if(
                !(d.left >= drawBox.right || d.right <= drawBox.left)
                && !(d.top >= drawBox.bottom || d.bottom <= drawBox.top)
            ) {
                // Collision
                return false;
            }
        }

        this.registerDrawBox(drawBox);
        return true;
    }

    private registerDrawBox(drawBox: DrawBox) {
        this.drawnBoxes.push(drawBox);
    }

    print(jsPdfGenerator: JsPdfGenerator): Promise<void> {
        return Container.getCache().then((cache) => {
            const doc = jsPdfGenerator.addPage(this.paper);

            return this.buildPrint(cache, doc).then(() => {
                return cache.clean();
            });
        });
    }

    private buildPrint(cache: Cache, doc: jsPDF): Promise<void> {

        return this.cutout.getProjection().projectToPdf(doc, this.paper, cache, this.progressCallback).then(() => {

            const edgeIntersections = this.cutout.getGrid().drawOnPdf(doc);

            this.drawFrameBackground(doc);

            this.registerDrawBox({
                top: this.cutout.options.margin_top_printable + this.cutout.options.margin_top_nonprintable,
                bottom: this.paper.height - this.cutout.options.margin_bottom_printable - this.cutout.options.margin_bottom_nonprintable,
                left: this.cutout.options.margin_left_printable + this.cutout.options.margin_left_nonprintable,
                right: this.paper.width - this.cutout.options.margin_right_printable - this.cutout.options.margin_right_nonprintable,
            });

            if(this.cutout.options.display_name) {
                this.drawMapName(doc);
            }
            this.drawCopyright(doc);
            if(this.cutout.options.display_scale) {
                this.drawScale(doc);
            }

            this.drawFrameCoordinates(doc, edgeIntersections);
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

    private drawMapName(doc: jsPDF) {
        const name = this.cutout.name;

        const fontSize = 12;
        const mmPerPt = 25.4 / 72;

        const strHeight = fontSize * mmPerPt;
        const strWidth = doc.getStringUnitWidth(name) * strHeight;

        const y = this.cutout.options.margin_top_nonprintable + strHeight - 2;
        const x = this.cutout.options.margin_left_printable + this.cutout.options.margin_left_nonprintable;

        this.registerDrawBox({top: y - strHeight, bottom: y, left: x, right: x + strWidth});
        doc.setFontSize(fontSize);
        doc.text(name, x, y);
    }

    private drawCopyright(doc: jsPDF) {
        const copyright = this.cutout.getProjection().getMapImageProvider().getCopyright();

        const fontSize = 6;
        const mmPerPt = 25.4 / 72;

        const strHeight = fontSize * mmPerPt;
        const strWidth = doc.getStringUnitWidth(copyright) * strHeight;

        const y = this.paper.height - this.cutout.options.margin_bottom_nonprintable;
        const x = this.paper.width - this.cutout.options.margin_right_printable - this.cutout.options.margin_right_nonprintable - strWidth;

        this.registerDrawBox({top: y - strHeight, bottom: y, left: x, right: x + strWidth});
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y - strHeight, strWidth, strHeight, 'F');
        doc.setFontSize(fontSize);
        doc.text(copyright, x, y);
    }

    private drawScale(doc: jsPDF) {
        let realWidth = 1000000; // mm -> = 1 km
        let barWidth = realWidth / this.cutout.getProjection().getScale();
        while(barWidth > 100) {
            barWidth /= 10;
            realWidth /= 10;
        }
        while(barWidth < 20) {
            barWidth *= 10;
            realWidth *= 10;
        }
        if(barWidth > 50) {
            barWidth /= 2;
            realWidth /= 2;
        }
        if(barWidth > 50) {
            barWidth /= 2.5;
            realWidth /= 2.5;
        }
        const barHeight = 1;

        const str0 = '0';
        const str1 = formatMeters(realWidth/1000) + ' = ' + formatCm(barWidth / 10) + ' (1:'+this.cutout.getProjection().getScale().toFixed(0)+')';

        const fontSize = 6;
        const mmPerPt = 25.4 / 72;
        const strHeight = fontSize * mmPerPt;
        const str0Width = doc.getStringUnitWidth(str0) * strHeight;
        const str1Width = doc.getStringUnitWidth(str1) * strHeight;

        const x = this.cutout.options.margin_left_printable + this.cutout.options.margin_left_nonprintable;
        const y = this.paper.height - this.cutout.options.margin_bottom_nonprintable - barHeight;

        this.registerDrawBox({
            top: y,
            bottom: y + barHeight,
            left: x,
            right: x + barWidth + str0Width + str1Width + 2 * 0.5,
        });

        const x_bar = x + 0.5 + str0Width;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(x_bar, y, barWidth, barHeight);
        for(let i=0; i<5; i++) {
            doc.line(x_bar + barWidth/10 * (2*i+1), y + barHeight/2, x_bar + barWidth/10 * (2*i+2), y + barHeight/2);
            doc.line(x_bar + barWidth/10 * (2*i+1), y, x_bar + barWidth/10 * (2*i+1), y + barHeight);
            if(i < 4) {
                doc.line(x_bar + barWidth/10 * (2*i+2), y, x_bar + barWidth/10 * (2*i+2), y + barHeight);
            }
        }

        doc.setFontSize(fontSize);
        doc.text(str0, x, y + barHeight);
        doc.text(str1, x + barWidth + str0Width + 2 * 0.5, y + barHeight);
    }

    private drawFrameCoordinates(doc: jsPDF, edgeIntersections: Record<string, EdgeIntersection<Coordinate>[]>) {
        const sides: PdfCoordinateDrawSide[] = ['top', 'left', 'right', 'bottom'];

        for(const side of sides) {
            if(!this.cutout.options['display_coords_' + side]) {
                continue;
            }
            for(const intersection of edgeIntersections[side]) {
                this.drawFrameCoordinate(doc, intersection.gridCoord, intersection.paperCoord, side);
            }
        }
    }

    private drawFrameCoordinate(doc: jsPDF, gridCoordinate: Coordinate, paperCoordinate: Point, side: PdfCoordinateDrawSide) {
        const ordinate = gridCoordinate.formatOrdinateForPdf((side === 'left' || side === 'right') ? 'y' : 'x');

        const fontSizeRetries = 6;
        for(let fontSizeRetry=0; fontSizeRetry <= fontSizeRetries; fontSizeRetry++) {
            const fontSize = 8 - fontSizeRetry/2;
            const mmPerPt = 25.4 / 72;

            const strHeight = fontSize * mmPerPt;
            const strWidth = doc.getStringUnitWidth(ordinate) * strHeight;

            let x = paperCoordinate.getX();
            let y = paperCoordinate.getY();
            const textOptions: TextOptionsLight = {};

            if(side === 'left') {
                if(this.cutout.options.rotate_y_coords) {
                    textOptions.angle = 90;
                    x += -1.0;
                    y += strWidth/2;
                } else {
                    x += -1.0 - strWidth;
                    y += -0.5 + strHeight/2;
                }
            } else if(side === 'top') {
                x += 0 - strWidth/2;
                y += -1.0;
            } else if(side === 'bottom') {
                x += 0 - strWidth/2;
                y += strHeight;
            } else if(side === 'right') {
                if(this.cutout.options.rotate_y_coords) {
                    textOptions.angle = -90;
                    x += 1.0;
                    y += -strWidth/2;
                } else {
                    x += 1.0;
                    y += -0.5 + strHeight/2;
                }
            }

            const drawBox: DrawBox = {top: y - strHeight, bottom: y, left: x, right: x + strWidth};
            if(this.cutout.options.rotate_y_coords) {
                if(side === 'left') {
                    drawBox.top = y - strWidth;
                    drawBox.right = x;
                    drawBox.left = x - strHeight;

                } else if(side === 'right') {
                    drawBox.top = y;
                    drawBox.bottom = y + strWidth;
                    drawBox.right = x + strHeight;
                }
            }

            doc.setFontSize(fontSize);

            if(fontSizeRetry < fontSizeRetries && (
                drawBox.left < this.cutout.options.margin_left_nonprintable
                || drawBox.top < this.cutout.options.margin_top_nonprintable
                || drawBox.bottom > this.cutout.getPaper().height - this.cutout.options.margin_bottom_nonprintable
                || drawBox.right > this.cutout.getPaper().width - this.cutout.options.margin_right_nonprintable
            )) {
                continue;
            }

            if(this.requestDrawBox(drawBox)) {
                doc.text(ordinate, x, y, textOptions);
                break;
            }
        }
    }

}
