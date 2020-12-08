import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

export default interface Conversion<S extends Coordinate, T extends Coordinate> {

    sourceSystem(): CoordinateSystem<S>;

    targetSystem(): CoordinateSystem<T>;

    convert(source: S): T;

    inverse(source: T): S;

}
