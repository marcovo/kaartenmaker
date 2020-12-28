import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Conversion from "../Conversion/Conversion";

export class PointSystem implements CoordinateSystem<Point> {
    readonly code: '';

    conversions(): Conversion<Point, Coordinate>[] {
        return [];
    }

    make(x: number, y: number): Point {
        return new Point(x, y);
    }

    fromPoint(point: Point): Point {
        return new Point(point.getX(), point.getY());
    }

    rebase(c: Point): CoordinateSystem<Point> {
        return this;
    }
}

export class Point implements Coordinate {
    readonly code = '';

    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static from(source: Coordinate): Point {
        return new Point(source.getX(), source.getY());
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    withinBounds(): boolean {
        return true;
    }

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean {
        return this.code === coordinateSystem.code;
    }

    clone<P extends this>(): P {
        return <P>new Point(this.x, this.y);
    }

    formatOrdinateForPdf(dimension: 'x' | 'y'): string {
        throw new Error('No formatting available for Point');
    }

    formats(): Record<string, () => string> {
        throw new Error('No formatting available for Point');
    }
}

export function walkLine<C extends Coordinate, S extends CoordinateSystem<C>>(s: S, a: C, b: C, steps: number, callback: (c: C, step: number) => void) {
    for(let i=0; i<steps; i++) {
        const p = i / (steps-1);

        const c = s.make(
            a.getX()*(1-p) + b.getX()*p,
            a.getY()*(1-p) + b.getY()*p
        );

        callback(c, i);
    }
}

export type LineSegment = {from: Point, to: Point};

export function lineSegmentsIntersection(line1: LineSegment, line2: LineSegment): Point|null {
    // https://stackoverflow.com/a/1968345
    let
        p0_x = line1.from.getX(), p0_y = line1.from.getY(),
        p1_x = line1.to.getX(), p1_y = line1.to.getY(),
        p2_x = line2.from.getX(), p2_y = line2.from.getY(),
        p3_x = line2.to.getX(), p3_y = line2.to.getY();

    let s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;

    let s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return new Point(
            p0_x + (t * s1_x),
            p0_y + (t * s1_y),
        );
    }

    return null; // No collision
}

export function dot<C extends Coordinate>(a: C, b: C): number {
    return a.getX() * b.getX() + a.getY() * b.getY();
}

export function polygonsOverlap<C extends Coordinate>(a: C[], b: C[]) {
    // http://web.archive.org/web/20141127210836/http://content.gpwiki.org/index.php/Polygon_Collision
    // Only works for convex polygons
    // TODO: is this more efficient than naively checking whether any edge of a intersects any edge of b + checking b contained in a or a contained in b?

    const findSeparatingAxis = (a: C[], b: C[]): boolean => {
        for(let i=0; i<a.length; i++) {
            const p1 = a[i];
            const p2 = a[(i+1)%a.length];

            const direction = new Point(p2.getX() - p1.getX(), p2.getY() - p1.getY());
            const normal = new Point(-direction.getY(), direction.getX());

            const projectionsA: number[] = [];
            for(const pa of a) {
                projectionsA.push(dot(normal, new Point(pa.getX(), pa.getY())));
            }

            const projectionsB: number[] = [];
            for(const pb of b) {
                projectionsB.push(dot(normal, new Point(pb.getX(), pb.getY())));
            }

            if(Math.max(...projectionsA) <= Math.min(...projectionsB)) {
                return true;
            }

            if(Math.max(...projectionsB) <= Math.min(...projectionsA)) {
                return true;
            }
        }

        return false;
    };

    return !(findSeparatingAxis(a, b) || findSeparatingAxis(b, a));
}
