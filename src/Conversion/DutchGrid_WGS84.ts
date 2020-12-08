import Conversion from "./Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "../Coordinates/DutchGrid";
import WGS84_DutchGrid from "./WGS84_DutchGrid";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

export default class DutchGrid_WGS84 implements Conversion<DutchGrid, WGS84> {
    private baseConversion;
    constructor() {
        this.baseConversion = new WGS84_DutchGrid();
    }

    sourceSystem(): CoordinateSystem<DutchGrid> {
        return new DutchGridSystem();
    }

    targetSystem(): CoordinateSystem<WGS84> {
        return new WGS84System();
    }

    convert(source: DutchGrid): WGS84 {
        return this.baseConversion.inverse(source);
    }

    inverse(source: WGS84): DutchGrid {
        return this.baseConversion.convert(source);
    }
}
