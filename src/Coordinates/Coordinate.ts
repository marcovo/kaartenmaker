import CoordinateSystem from "./CoordinateSystem";

export default interface Coordinate {
    readonly name: string;

    getX(): number;

    getY(): number;

    withinBounds(): boolean;

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean;

    clone(): this;

    formatOrdinateForPdf(dimension: 'x' | 'y'): string;
}
