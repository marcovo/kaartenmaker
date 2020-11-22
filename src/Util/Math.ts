import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

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
