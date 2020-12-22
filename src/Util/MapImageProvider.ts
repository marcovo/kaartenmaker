import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";

export default interface MapImageProvider {
    getCopyright(): string;

    getDefaultGridCoordinateSystem(): CoordinateSystem<Coordinate>;

    downloadLegend();
}
