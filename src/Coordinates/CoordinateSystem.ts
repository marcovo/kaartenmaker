import Coordinate from "./Coordinate";
import Conversion from "../Conversion/Conversion";
import {Point} from "../Util/Math";

export default interface CoordinateSystem<C extends Coordinate> {
    readonly code: string;
    readonly name: string;

    make(...args: any): C;

    fromPoint(point: Point): C;

    conversions(): Conversion<C, Coordinate>[];

    rebase(c: C): CoordinateSystem<C>;
}
