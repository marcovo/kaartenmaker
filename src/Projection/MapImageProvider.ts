import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";

export type MipDrawnGrid = {
    base_x: number,
    delta_x: number,
    base_y: number,
    delta_y: number,
};

export default interface MapImageProvider {
    readonly name: string;
    readonly title: string;

    getCopyright(): string;

    getDefaultGridCoordinateSystem(): CoordinateSystem<Coordinate>;

    downloadLegend();
}
