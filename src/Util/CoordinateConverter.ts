import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";
import Conversion from "../Conversion/Conversion";
import ConversionComposition from "../Conversion/ConversionComposition";
import CartesianTransformation from "../Conversion/CartesianTransformation";

export default class CoordinateConverter {
    private static coordinateSystems: Record<string, CoordinateSystem<Coordinate>> = {};
    private static conversions: Record<string, Record<string, Conversion<Coordinate, Coordinate>>> = {};

    static registerCoordinateSystem(s: CoordinateSystem<Coordinate>) {
        CoordinateConverter.coordinateSystems[s.name] = s;
    }

    static getCoordinateSystem(name: string) {
        if(CoordinateConverter.coordinateSystems.hasOwnProperty(name)) {
            return CoordinateConverter.coordinateSystems[name];
        }

        throw new Error('Unknown coordinate system "' + name + '"');
    }

    static convert(source: Coordinate, targetSystem: CoordinateSystem<Coordinate>) {
        if(source.name === targetSystem.name) {
            return source;
        }

        return this.conversion(CoordinateConverter.getCoordinateSystem(source.name), targetSystem).convert(source);
    }

    static conversion(sourceSystem: CoordinateSystem<Coordinate>, targetSystem: CoordinateSystem<Coordinate>) {
        if(sourceSystem.name === targetSystem.name) {
            return CartesianTransformation.build(sourceSystem).make();
        }

        let conversion = null;
        if(CoordinateConverter.conversions.hasOwnProperty(sourceSystem.name)) {
            if(CoordinateConverter.conversions[sourceSystem.name].hasOwnProperty(targetSystem.name)) {
                conversion = CoordinateConverter.conversions[sourceSystem.name][targetSystem.name];
            }
        }

        if(conversion === null) {
            conversion = CoordinateConverter.fetchConversion(CoordinateConverter.getCoordinateSystem(sourceSystem.name), targetSystem);
            if(conversion === null) {
                throw new Error('Could not find conversion between "' + sourceSystem.name + '" and "' + targetSystem.name + '"');
            }

            if(!CoordinateConverter.conversions.hasOwnProperty(sourceSystem.name)) {
                CoordinateConverter.conversions[sourceSystem.name] = {};
            }
            CoordinateConverter.conversions[sourceSystem.name][targetSystem.name] = conversion;
        }

        return conversion;
    }

    static fetchConversion(
        sourceSystem: CoordinateSystem<Coordinate>,
        targetSystem: CoordinateSystem<Coordinate>,
        seen: string[] = []
    ): Conversion<Coordinate, Coordinate>|null {
        const conversions = sourceSystem.conversions();
        seen.push(sourceSystem.name);

        for(const conversion of conversions) {
            if(conversion.targetSystem().name === targetSystem.name) {
                return conversion;
            }
        }

        for(const conversion of conversions) {
            const nextSystem = conversion.targetSystem();
            if(seen.indexOf(nextSystem.name) > -1) {
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
