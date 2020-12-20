
export default interface Coordinate {
    readonly name: string;

    getX(): number;

    getY(): number;

    withinBounds(): boolean;

    clone(): this;

    formatOrdinateForPdf(dimension: 'x' | 'y'): string;
}
