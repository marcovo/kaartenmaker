import Conversion from "./Conversion";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";

export default class CartesianTransformation<C extends Coordinate> implements Conversion<C, C> {
    private constructor(private coordinateSystem: CoordinateSystem<C>, private matrix: number[][]) {
    }

    sourceSystem(): CoordinateSystem<C> {
        return this.coordinateSystem;
    }

    targetSystem(): CoordinateSystem<C> {
        return this.coordinateSystem;
    }

    convert(source: C): C {
        return this.coordinateSystem.make(
            this.matrix[0][0] * source.getX() + this.matrix[0][1] * source.getY() + this.matrix[0][2],
            this.matrix[1][0] * source.getX() + this.matrix[1][1] * source.getY() + this.matrix[1][2],
        );
    }

    inverse(source: C): C {
        const x = source.getX() - this.matrix[0][2];
        const y = source.getY() - this.matrix[1][2];

        const det = this.matrix[0][0] * this.matrix[1][1] - this.matrix[0][1] * this.matrix[1][0];

        if(det === 0) {
            throw new Error('Cannot invert');
        }

        return this.coordinateSystem.make(
            (this.matrix[1][1] * x - this.matrix[0][1] * y)/det,
            (-this.matrix[1][0] * x + this.matrix[0][0] * y)/det,
        );
    }

    static build<CInner extends Coordinate>(coordinateSystem: CoordinateSystem<CInner>) {
        return new class {
            private matrix: number[][] = [[1, 0, 0], [0, 1, 0]];

            translate(delta: CInner): this {
                this.matrix[0][2] += delta.getX();
                this.matrix[1][2] += delta.getY();

                return this;
            }

            scale(factor: number): this {
                this.matrix[0][0] *= factor;
                this.matrix[0][1] *= factor;
                this.matrix[0][2] *= factor;
                this.matrix[1][0] *= factor;
                this.matrix[1][1] *= factor;
                this.matrix[1][2] *= factor;

                return this;
            }

            mulMatrix(matrix: number[][]): this {
                this.matrix = [
                    [
                        matrix[0][0] * this.matrix[0][0] + matrix[0][1] * this.matrix[1][0],
                        matrix[0][0] * this.matrix[0][1] + matrix[0][1] * this.matrix[1][1],
                        matrix[0][0] * this.matrix[0][2] + matrix[0][1] * this.matrix[1][2],
                    ],
                    [
                        matrix[1][0] * this.matrix[0][0] + matrix[1][1] * this.matrix[1][0],
                        matrix[1][0] * this.matrix[0][1] + matrix[1][1] * this.matrix[1][1],
                        matrix[1][0] * this.matrix[0][2] + matrix[1][1] * this.matrix[1][2],
                    ],
                ];
                return this;
            }

            make(): CartesianTransformation<CInner> {
                return new CartesianTransformation(coordinateSystem, this.matrix);
            }
        }
    }
}
