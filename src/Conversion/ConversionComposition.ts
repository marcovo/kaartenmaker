import Conversion from "./Conversion";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";

export default class ConversionComposition<S extends Coordinate, P extends Coordinate, T extends Coordinate> implements Conversion<S, T> {

    constructor(private conversion1: Conversion<S, P>, private conversion2: Conversion<P, T>) {
    }

    sourceSystem(): CoordinateSystem<S> {
        return this.conversion1.sourceSystem();
    }

    targetSystem(): CoordinateSystem<T> {
        return this.conversion2.targetSystem();
    }

    convert(source: S): T {
        return this.conversion2.convert(this.conversion1.convert(source));
    }

    inverse(source: T): S {
        return this.conversion1.inverse(this.conversion2.inverse(source));
    }
}
