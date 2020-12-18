import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Conversion from "../Conversion/Conversion";

export class PointSystem implements CoordinateSystem<Point> {
    readonly name: '';

    conversions(): Conversion<Point, Coordinate>[] {
        return [];
    }

    make(x: number, y: number): Point {
        return new Point(x, y);
    }

    rebase(c: Point): CoordinateSystem<Point> {
        return this;
    }
}

export class Point implements Coordinate {
    readonly name = '';

    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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

    clone<P extends this>(): P {
        return <P>new Point(this.x, this.y);
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
