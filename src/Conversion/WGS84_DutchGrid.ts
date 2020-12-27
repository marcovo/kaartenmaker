import Conversion from "./Conversion";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "../Coordinates/DutchGrid";
import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

/**
 * Functions to convert coordinates:
 *
 * - Dutch Rijksdriehoek coordinates (R/D, EPSG:28992)
 * - WGS84 coordinates (latitude/longitude, EPSG:4326).
 * - Mercator meters (EPSG:54004)
 */

class Bessel implements Coordinate {
    readonly name = 'EPSG:7004'; // Correct?

    readonly lat: number;
    readonly lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    getX(): number {
        return this.lng;
    }

    getY(): number {
        return this.lat;
    }

    withinBounds(): boolean {
        // TODO: Is this correct?
        return -180 <= this.lng && this.lng <= 180 && -90 <= this.lat && this.lat <= 90;
    }

    belongsTo(coordinateSystem: CoordinateSystem<Coordinate>): boolean {
        return this.name === coordinateSystem.name;
    }

    clone<C extends this>(): C {
        return <C>new Bessel(this.lat, this.lng);
    }

    formatOrdinateForPdf(dimension: 'x' | 'y'): string {
        throw new Error('No formatting available for Bessel');
    }

    formats(): Record<string, () => string> {
        throw new Error('No formatting available for Bessel');
    }
}

export default class WGS84_DutchGrid implements Conversion<WGS84, DutchGrid> {

    sourceSystem(): CoordinateSystem<WGS84> {
        return new WGS84System();
    }

    targetSystem(): CoordinateSystem<DutchGrid> {
        return new DutchGridSystem();
    }

    // Constants neccessary Projection translation
    readonly WGS84_SEMI_MAJOR_AXIS = 6378137.0;
    readonly WGS84_SEMI_MINOR_AXIS = 6356752.31424518;
    readonly WGS84_ECCENTRICITY    = 0.0818191913108718138;
    //WGS84_ECCENTRICITY: Math.sqrt( 1.0 - Math.pow( 6356752.31424518 / 6378137.0, 2 ) )  // minor / major axis

    // Constants for faster conversions
    readonly rad2deg = 180 / Math.PI;
    readonly deg2rad = Math.PI / 180;
    readonly PI_HALF = Math.PI / 2;

    /**
     * Convert Rijksdriehoek (R/D) coordinates to WGS (lat/lon) coordinates.
     */
    RD_to_Bessel(source: DutchGrid): Bessel
    {
        const x0      = 155000;
        const y0      = 463000;
        const k       = 0.9999079;
        const bigr    = 6382644.571;
        const m       = 0.003773954;
        const n       = 1.000475857;
        const lambda0 = 0.094032038;
        const phi0    = 0.910296727;
        const l0      = 0.094032038;
        const b0      = 0.909684757;
        const e       = 0.081696831;
        const a       = 6377397.155;

        const rdX = source.x;
        const rdY = source.y;
        // This calculation was based from the sourcecode of Ejo Schrama's software <schrama@geo.tudelft.nl>.
        // You can find his software on: http://www.xs4all.nl/~digirini/contents/gps.html

        // Convert RD to Bessel

        // Get radius from origin.
        let d_1 = rdX - x0;
        const d_2 = rdY - y0;
        const r   = Math.sqrt( Math.pow(d_1, 2) + Math.pow(d_2, 2) );  // Pythagoras

        // Get Math.sin/Math.cos of the angle
        const sa  = (r != 0 ? d_1 / r : 0);  // the if prevents devision by zero.
        const ca  = (r != 0 ? d_2 / r : 0);

        const psi  = Math.atan2(r, k * 2 * bigr) * 2;   // php does (y,x), excel does (x,y)
        const cpsi = Math.cos(psi);
        const spsi = Math.sin(psi);

        const sb = (ca * Math.cos(b0) * spsi) + (Math.sin(b0) * cpsi);
        d_1 = sb;

        const cb = Math.sqrt(1 - Math.pow(d_1, 2));  // = Math.cos(b)
        const b  = Math.acos(cb);

        const sdl = sa * spsi / cb;  // = Math.sin(dl)
        const dl  = Math.asin(sdl);         // delta-lambda

        const lambda_1 = dl / n + lambda0;
        const w        = Math.log(Math.tan((b / 2) + (Math.PI / 4)));
        const q        = (w - m) / n;

        // Create first phi and delta-q
        const phiprime = (Math.atan(Math.exp(q)) * 2) - (Math.PI / 2);
        const dq_1     = (e / 2) * Math.log((e * Math.sin(phiprime) + 1) / (1 - e * Math.sin(phiprime)));
        const phi_1    = (Math.atan(Math.exp(q + dq_1)) * 2) - (Math.PI / 2);

        // Create new phi with delta-q
        const dq_2     = (e / 2) * Math.log((e * Math.sin(phi_1) + 1) / (1 - e * Math.sin(phi_1)));
        const phi_2    = (Math.atan(Math.exp(q + dq_2)) * 2) - (Math.PI / 2);

        // and again..
        const dq_3     = (e / 2) * Math.log((e * Math.sin(phi_2) + 1) / (1 - e * Math.sin(phi_2)));
        const phi_3    = (Math.atan(Math.exp(q + dq_3)) * 2) - (Math.PI / 2);

        // and again...
        const dq_4     = (e / 2) * Math.log((e * Math.sin(phi_3) + 1) / (1 - e * Math.sin(phi_3)));
        const phi_4    = (Math.atan(Math.exp(q + dq_4)) * 2) - (Math.PI / 2);

        // radians to degrees
        const lambda_2 = lambda_1 / Math.PI * 180;  //
        const phi_5    = phi_4    / Math.PI * 180;

        return new Bessel(phi_5, lambda_2);
    }

    Bessel_to_WGS84(source: Bessel): WGS84
    {
        var phi_5 = source.lat;
        var lambda_2 = source.lng;

        // Bessel to wgs84 (lat/lon)
        const dphi   = phi_5    - 52;   // delta-phi
        const dlam   = lambda_2 -  5;   // delta-lambda

        const phicor = (-96.862 - (dphi * 11.714) - (dlam * 0.125)) * 0.00001; // correction factor?
        const lamcor = ((dphi * 0.329) - 37.902 - (dlam * 14.667))  * 0.00001;

        const phiwgs = phi_5    + phicor;
        const lamwgs = lambda_2 + lamcor;

        return new WGS84(phiwgs, lamwgs);
    }

    inverse(source: DutchGrid): WGS84 {
        return this.Bessel_to_WGS84(this.RD_to_Bessel(source));
    }

    /**
     * Convert WGS (lat/lon) coordinates to Rijksdriehoek (R/D) coordinates.
     */
    WGS84_to_Bessel(source: WGS84): Bessel
    {
        const lat = source.lat;
        const lon = source.lng;

        // wgs84 to bessel
        const dphi = lat - 52;
        const dlam = lon - 5;

        const phicor = ( -96.862 - dphi * 11.714 - dlam * 0.125 ) * 0.00001;
        const lamcor = ( dphi * 0.329 - 37.902 - dlam * 14.667 ) * 0.00001;

        const phibes = lat - phicor;
        const lambes = lon - lamcor;

        return new Bessel(phibes, lambes);
    }

    Bessel_to_RD(source: Bessel): DutchGrid
    {
        const x0      = 155000;
        const y0      = 463000;
        const k       = 0.9999079;
        const bigr    = 6382644.571;
        const m       = 0.003773954;
        const n       = 1.000475857;
        const lambda0 = 0.094032038;
        const phi0    = 0.910296727;
        const l0      = 0.094032038;
        const b0      = 0.909684757;
        const e       = 0.081696831;
        const a       = 6377397.155;

        const phibes = source.lat;
        const lambes = source.lng;

        // bessel to rd
        const phi		= phibes / 180 * Math.PI;
        const lambda	= lambes / 180 * Math.PI;
        const qprime	= Math.log( Math.tan( phi / 2 + Math.PI / 4 ));
        const dq		= e / 2 * Math.log(( e * Math.sin(phi) + 1 ) / ( 1 - e * Math.sin( phi ) ) );
        const q			= qprime - dq;

        const w			= n * q + m;
        const b			= Math.atan( Math.exp( w ) ) * 2 - Math.PI / 2;
        const dl		= n * ( lambda - lambda0 );

        const d_1		= Math.sin( ( b - b0 ) / 2 );
        const d_2		= Math.sin( dl / 2 );

        const s2psihalf	= d_1 * d_1 + d_2 * d_2 * Math.cos( b ) * Math.cos ( b0 );
        const cpsihalf	= Math.sqrt( 1 - s2psihalf );
        const spsihalf	= Math.sqrt( s2psihalf );
        const tpsihalf	= spsihalf / cpsihalf;

        const spsi		= spsihalf * 2 * cpsihalf;
        const cpsi		= 1 - s2psihalf * 2;

        const sa		= Math.sin( dl ) * Math.cos( b ) / spsi;
        const ca		= ( Math.sin( b ) - Math.sin( b0 ) * cpsi ) / ( Math.cos( b0 ) * spsi );

        const r			= k * 2 * bigr * tpsihalf;
        const x			= r * sa + x0;
        const y			= r * ca + y0;

        return new DutchGrid(x, y);
    }

    convert(source: WGS84): DutchGrid {
        return this.Bessel_to_RD(this.WGS84_to_Bessel(source));
    }

}
