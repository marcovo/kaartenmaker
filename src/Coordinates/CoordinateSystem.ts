import Coordinate from "./Coordinate";
import Conversion from "../Conversion/Conversion";

export default interface CoordinateSystem<C extends Coordinate> {
    readonly name: string;

    make(...args: any): C;

    conversions(): Conversion<C, Coordinate>[];

    rebase(c: C): CoordinateSystem<C>;
}
