import Coordinate from "../Coordinates/Coordinate";
import Wms, {WmsParams} from "../Util/Wms";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Cutout from "./Cutout";
import CoordinateConverter from "../Util/CoordinateConverter";

export default class Projection<C extends Coordinate> {

    private cutout: Cutout<any, C, any, any> = null;
    coordinateSystem: CoordinateSystem<C>;
    anchor: C;

    constructor(readonly wms: Wms, private scale: number) {
        this.coordinateSystem = this.wms.getCoordinateSystem();
    }

    attach(cutout: Cutout<any, C, any, any>) {
        if(this.cutout !== null) {
            throw new Error('Already attached');
        }

        this.cutout = cutout;
    }

    setAnchor(coordinate: Coordinate) {
        this.anchor = CoordinateConverter.convert(coordinate, this.coordinateSystem);
        this.coordinateSystem = this.coordinateSystem.rebase(this.anchor);
    }

    getScale(): number {
        return this.scale;
    }

    getWmsUrl(coords: C[], params: WmsParams = {}) {
        return this.wms.mapUrl(Object.assign({}, params, {
            bbox: coords[3].getX() + ',' + coords[3].getY() + ',' + coords[1].getX() + ',' + coords[1].getY(),
        }));
    }
}
