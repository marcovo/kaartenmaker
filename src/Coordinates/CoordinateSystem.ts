import Coordinate from "./Coordinate";

export default interface CoordinateSystem<C extends Coordinate> {
    make(...args: any): C;
}
