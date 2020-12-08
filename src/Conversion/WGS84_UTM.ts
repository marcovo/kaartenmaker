
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import UTM, {UTMSystem} from "../Coordinates/UTM";
import Conversion from "./Conversion";
import CoordinateSystem from "../Coordinates/CoordinateSystem";

/**
 * Actually, projecting WGS84 to UTM amounts to going through:
 *  WGS84 <-> ITRS <-> ETRS89 <-> UTM
 *
 * https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system#From_latitude,_longitude_(%CF%86,_%CE%BB)_to_UTM_coordinates_(E,_N)
 * https://geographiclib.sourceforge.io/html/transversemercator.html#tmseries
 * https://www.gsi.go.jp/common/000065826.pdf
 * https://www.gsi.go.jp/common/000062452.pdf
 * https://geographiclib.sourceforge.io/html/TransverseMercator_8cpp_source.html#l00045
 * https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=2ahUKEwi6-YPWgYvmAhWQalAKHVuSAD0QFjAAegQIBRAC&url=https%3A%2F%2Ficaci.org%2Ffiles%2Fdocuments%2FICC_proceedings%2FICC2007%2Fdocuments%2Fdoc%2FTHEME%25202%2Foral%25201%2F2.1.2%2520A%2520HIGHLY%2520ACCURATE%2520WORLD%2520WIDE%2520ALGORITHM%2520FOR%2520THE%2520TRANSVE.doc&usg=AOvVaw3Rl9gJJSqRaYbjCM1SI_ul
 */
export default class WGS84_UTM implements Conversion<WGS84, UTM> {

    sourceSystem(): CoordinateSystem<WGS84> {
        return new WGS84System();
    }

    targetSystem(): CoordinateSystem<UTM> {
        return new UTMSystem(0, 0); // TODO Dummy parameters
    }

    public k: number;
    public gamma: number;

    constructor(readonly zone: number|null = null) {
    }

    convert(source: WGS84): UTM {

        const phi = source.lat;
        const lambda = source.lng;

        // Use requested zone or closest zone
        const zone = (this.zone !== null) ? this.zone : Math.floor((lambda + 180) / 6) + 1;

        const phi_rad = phi * (Math.PI / 180);
        const lambda0 = (zone - 1) * 6 - 180 + 3;
        const dlambda_rad = (lambda - lambda0) * (Math.PI / 180);

        const hemi = (source.lat >= 0) ? 1 : -1;

        const a = 6378.137;
        const f = 1 / 298.257223563;
        const N0 = (hemi === 1) ? 0 : 10000;

        const n = f / (2 - f);
        const A = a / (1 + n) * (1 + n*n/4 + n*n*n*n/64);
        const alpha = [];
        alpha[1] = n/2 - 2/3*n*n + 5/16*n*n*n;
        alpha[2] = 13/48*n*n - 3/5*n*n*n;
        alpha[3] = 61/240*n*n*n;
        const beta = [];
        beta[1] = n/2 - 2/3*n*n + 37/96*n*n*n;
        beta[2] = 1/48*n*n + 1/15*n*n*n;
        beta[3] = 17/480*n*n*n;
        const delta = [];
        delta[1] = 2*n - 2/3*n*n - 2*n*n*n;
        delta[2] = 7/3*n*n - 8/5*n*n*n;
        delta[3] = 56/15*n*n*n;
        const k0 = 0.9996;
        const E0 = 500;

        const t = Math.sinh(Math.atanh(Math.sin(phi_rad)) - 2 * Math.sqrt(n) / (1 + n) * Math.atanh(2*Math.sqrt(n) / (1 + n) * Math.sin(phi_rad)));
        const xip = Math.atan(t / Math.cos(dlambda_rad));
        const etap = Math.atanh(Math.sin(dlambda_rad) / Math.sqrt(1 + t*t));
        let sigma = 1;
        let tau = 0;
        let E = E0 + k0*A*etap;
        let N = N0 + k0*A*xip;
        for(let j=1; j<=3; j++) {
            sigma += 2 * j * alpha[j] * Math.cos(2 * j * xip) * Math.cosh(2 * j * etap);
            tau   += 2 * j * alpha[j] * Math.sin(2 * j * xip) * Math.sinh(2 * j * etap);

            E += k0 * A * alpha[j] * Math.cos(2 * j * xip) * Math.sinh(2 * j * etap);
            N += k0 * A * alpha[j] * Math.sin(2 * j * xip) * Math.cosh(2 * j * etap);
        }

        this.k = k0*A/a * Math.sqrt((1 + ( (1-n)/(1+n) * Math.tan(phi_rad) )**2 ) * (sigma*sigma + tau*tau) / (t*t + Math.cos(dlambda_rad)**2));
        this.gamma = Math.atan( (tau*Math.sqrt(1+t*t) + sigma*t*Math.tan(dlambda_rad)) / (sigma*Math.sqrt(1+t*t) - tau*t*Math.tan(dlambda_rad)));

        return new UTM(E * 1000, N * 1000, zone, hemi);
    }

    inverse(source: UTM): WGS84 {

        const E = source.E / 1000;
        const N = source.N / 1000;
        const zone = source.zone;
        const hemi = source.hemi;

        const a = 6378.137;
        const f = 1 / 298.257223563;
        const N0 = (hemi === 1) ? 0 : 10000;

        const n = f / (2 - f);
        const A = a / (1 + n) * (1 + n*n/4 + n*n*n*n/64);
        const alpha = [];
        alpha[1] = n/2 - 2/3*n*n + 5/16*n*n*n;
        alpha[2] = 13/48*n*n - 3/5*n*n*n;
        alpha[3] = 61/240*n*n*n;
        const beta = [];
        beta[1] = n/2 - 2/3*n*n + 37/96*n*n*n;
        beta[2] = 1/48*n*n + 1/15*n*n*n;
        beta[3] = 17/480*n*n*n;
        const delta = [];
        delta[1] = 2*n - 2/3*n*n - 2*n*n*n;
        delta[2] = 7/3*n*n - 8/5*n*n*n;
        delta[3] = 56/15*n*n*n;
        const k0 = 0.9996;
        const E0 = 500;

        const xi = (N - N0) / (k0 * A);
        const eta = (E - E0) / (k0 * A);
        let xip = xi;
        let etap = eta;
        let sigmap = 1;
        let taup = 0;

        for(let j=1; j<=3; j++) {
            xip  -= beta[j] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
            etap -= beta[j] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);

            sigmap -= 2 * j * beta[j] * Math.cos(2 * j * xi) * Math.cosh(2 * j * eta);
            taup   += 2 * j * beta[j] * Math.sin(2 * j * xi) * Math.sinh(2 * j * eta);
        }

        const chi = Math.asin(Math.sin(xip) / Math.cosh(etap));

        let phi_rad = chi;
        for(let j=1; j<=3; j++) {
            phi_rad += delta[j] * Math.sin(2 * j * chi);
        }

        const dlambda_rad = Math.atan(Math.sinh(etap) / Math.cos(xip));

        this.k = k0*A/a * Math.sqrt((1 + ( (1-n)/(1+n) * Math.tan(phi_rad) )**2 ) * (Math.cos(xip)**2 + Math.sinh(etap)**2) / (sigmap**2 + taup**2));
        this.gamma = hemi * (Math.atan((taup + sigmap * Math.tan(xip) * Math.tanh(etap)) / (sigmap - taup * Math.tan(xip) * Math.tanh(etap))));

        const phi = phi_rad * (180 / Math.PI);
        const lambda0 = zone * 6 - 183;
        const lambda = lambda0 + dlambda_rad * (180 / Math.PI);

        return new WGS84(phi, lambda);
    }
}
