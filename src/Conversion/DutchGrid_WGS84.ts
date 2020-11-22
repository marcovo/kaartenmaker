import Conversion from "./Conversion";
import WGS84 from "../Coordinates/WGS84";
import DutchGrid from "../Coordinates/DutchGrid";
import WGS84_DutchGrid from "./WGS84_DutchGrid";

export default class DutchGrid_WGS84 implements Conversion<DutchGrid, WGS84> {
    private baseConverter;
    constructor() {
        this.baseConverter = new WGS84_DutchGrid();
    }

    convert(source: DutchGrid): WGS84 {
        return this.baseConverter.inverse(source);
    }

    inverse(source: WGS84): DutchGrid {
        return this.baseConverter.convert(source);
    }
}
