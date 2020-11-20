import {Container} from "inversify";
import {TYPES} from "./types";
import Conversion from "./Conversion/Conversion";
import WGS84 from "./Coordinates/WGS84";
import DutchGrid from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import DutchGrid_WGS84 from "./Conversion/DutchGrid_WGS84";

const container = new Container();
container.bind<Conversion<WGS84, DutchGrid>>(TYPES.Conversion).to(WGS84_DutchGrid);
container.bind<Conversion<DutchGrid, WGS84>>(TYPES.Conversion).to(DutchGrid_WGS84);

export { container };
