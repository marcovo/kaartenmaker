import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";

export default class Grid<C extends Coordinate> {

    private cutout: Cutout<any, any, any> = null;

    constructor(readonly coordinateSystem: CoordinateSystem<C>) {

    }

    attach(cutout: Cutout<any, any, any>) {
        if(this.cutout !== null) {
            throw new Error('Already attached');
        }

        this.cutout = cutout;
    }
}
