import Conversion from "./Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import UTM, {UTMSystem} from "../Coordinates/UTM";
import WGS84_UTM from "./WGS84_UTM";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

export default class UTM_WGS84 implements Conversion<UTM, WGS84> {
    private baseConversion: WGS84_UTM;
    constructor() {
        this.baseConversion = new WGS84_UTM();
    }

    sourceSystem(): CoordinateSystem<UTM> {
        return new UTMSystem(0, 0); // TODO Dummy parameters
    }

    targetSystem(): CoordinateSystem<WGS84> {
        return new WGS84System();
    }

    convert(source: UTM): WGS84 {
        return this.baseConversion.inverse(source);
    }

    inverse(source: WGS84): UTM {
        return this.baseConversion.convert(source);
    }
}
