import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";

export default interface MapImageProvider {
    readonly name: string;
    readonly title: string;

    getCopyright(): string;

    getDefaultGridCoordinateSystem(): CoordinateSystem<Coordinate>;

    downloadLegend();

    getBoundingPolygon(): Promise<Coordinate[]>;
}
