import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";
import Conversion from "../Conversion/Conversion";
import ConversionComposition from "../Conversion/ConversionComposition";
import CartesianTransformation from "../Conversion/CartesianTransformation";

export default class CoordinateConverter {
    private static coordinateSystems: Record<string, CoordinateSystem<Coordinate>> = {};
    private static conversions: Record<string, Record<string, Conversion<Coordinate, Coordinate>>> = {};

    static registerCoordinateSystem(s: CoordinateSystem<Coordinate>) {
        CoordinateConverter.coordinateSystems[s.code] = s;
    }

    static getCoordinateSystem(code: string) {
        if(CoordinateConverter.coordinateSystems.hasOwnProperty(code)) {
            return CoordinateConverter.coordinateSystems[code];
        }

        throw new Error('Unknown coordinate system "' + code + '"');
    }

    static convert<C extends Coordinate>(source: Coordinate, targetSystem: CoordinateSystem<C>): C {
        if(source.code === targetSystem.code) {
            // @ts-ignore
            return source;
        }

        return this.conversion(CoordinateConverter.getCoordinateSystem(source.code), targetSystem).convert(source);
    }

    static convertPolygon<C extends Coordinate>(sourcePolygon: Coordinate[], targetSystem: CoordinateSystem<C>): C[] {
        if(sourcePolygon.length === 0 || sourcePolygon[0].code === targetSystem.code) {
            // @ts-ignore
            return sourcePolygon;
        }

        const conversion = this.conversion(CoordinateConverter.getCoordinateSystem(sourcePolygon[0].code), targetSystem);

        const targetPolygon = <C[]>[];
        for(let i=0; i<sourcePolygon.length; i++) {
            targetPolygon.push(conversion.convert(sourcePolygon[i]));
        }

        return targetPolygon;
    }

    static conversion(sourceSystem: CoordinateSystem<Coordinate>, targetSystem: CoordinateSystem<Coordinate>) {
        if(sourceSystem.code === targetSystem.code) {
            return CartesianTransformation.build(sourceSystem).make();
        }

        let conversion = null;
        if(CoordinateConverter.conversions.hasOwnProperty(sourceSystem.code)) {
            if(CoordinateConverter.conversions[sourceSystem.code].hasOwnProperty(targetSystem.code)) {
                conversion = CoordinateConverter.conversions[sourceSystem.code][targetSystem.code];
            }
        }

        if(conversion === null) {
            conversion = CoordinateConverter.fetchConversion(CoordinateConverter.getCoordinateSystem(sourceSystem.code), targetSystem);
            if(conversion === null) {
                throw new Error('Could not find conversion between "' + sourceSystem.code + '" and "' + targetSystem.code + '"');
            }

            if(!CoordinateConverter.conversions.hasOwnProperty(sourceSystem.code)) {
                CoordinateConverter.conversions[sourceSystem.code] = {};
            }
            CoordinateConverter.conversions[sourceSystem.code][targetSystem.code] = conversion;
        }

        return conversion;
    }

    static fetchConversion(
        sourceSystem: CoordinateSystem<Coordinate>,
        targetSystem: CoordinateSystem<Coordinate>,
        seen: string[] = []
    ): Conversion<Coordinate, Coordinate>|null {
        const conversions = sourceSystem.conversions();
        seen.push(sourceSystem.code);

        for(const conversion of conversions) {
            if(conversion.targetSystem().code === targetSystem.code) {
                return conversion;
            }
        }

        for(const conversion of conversions) {
            const nextSystem = conversion.targetSystem();
            if(seen.indexOf(nextSystem.code) > -1) {
                continue;
            }

            const nextConversion = CoordinateConverter.fetchConversion(nextSystem, targetSystem, seen);
            if(nextConversion !== null) {
                return new ConversionComposition(conversion, nextConversion);
            }
        }

        return null;
    }
}
