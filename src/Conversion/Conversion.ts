import Coordinate from "../Coordinates/Coordinate";

export default interface Conversion<S extends Coordinate, T extends Coordinate> {

    convert(source: S): T;

    inverse(source: T): S;

}
