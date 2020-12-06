import Conversion from "./Conversion";
import WGS84 from "../Coordinates/WGS84";
import UTM from "../Coordinates/UTM";
import WGS84_UTM from "./WGS84_UTM";

export default class UTM_WGS84 implements Conversion<UTM, WGS84> {
    private baseConverter: WGS84_UTM;
    constructor() {
        this.baseConverter = new WGS84_UTM();
    }

    convert(source: UTM): WGS84 {
        return this.baseConverter.inverse(source);
    }

    inverse(source: WGS84): UTM {
        return this.baseConverter.convert(source);
    }
}
