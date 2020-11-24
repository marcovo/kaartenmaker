import Coordinate from "../Coordinates/Coordinate";
import Wms, {WmsParams} from "../Util/Wms";

export default class Projection<C extends Coordinate> {

    constructor(private wms: Wms, private scale: number) {

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
