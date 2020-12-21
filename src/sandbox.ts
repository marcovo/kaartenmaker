import WGS84_UTM from "./Conversion/WGS84_UTM";
import WGS84 from "./Coordinates/WGS84";
import DutchGrid from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import {polygonsOverlap} from "./Util/Math";
import CoordinateConverter from "./Util/CoordinateConverter";

/*const WmsGermany = new Wms('https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi');

const url = WmsGermany.mapUrl({
    'bbox' : '437000,5446000,439000,5448000',
    'width' : '50',
    'height' : '50',
})

console.log(url);*/

const c1 = new WGS84_UTM();
//const proj = new Projection<UTM>(new WmsGermanyRP(), 25000, new UTMSystem(c1.zone, c1.hemi));
//const url2 = proj.getWmsUrl([null, c1.convert(new WGS84(49.018895, 8.344384)), null, c1.convert(new WGS84(49.002492, 8.288909))]);
//const url2 = proj.getWmsUrl([null, c1.convert(new WGS84(49.19894, 7.99911)), null, c1.convert(new WGS84(48.99894, 7.66581))]);
//console.log(url2);
console.log(c1.inverse(c1.convert(new WGS84(49.19894, 7.99911))));

const a:WGS84 = new WGS84(51, 4);
const b:DutchGrid = (new WGS84_DutchGrid()).convert(a);
const c = a.toLeaflet();

console.log(a, b, c);

const pa = [
    new DutchGrid(1, 1),
    new DutchGrid(2, 1),
    new DutchGrid(2, 2),
    new DutchGrid(1, 2),
];

const pb = [
    new DutchGrid(0.5, 0.5),
    new DutchGrid(4, 3),
    new DutchGrid(4, 4),
    new DutchGrid(3, 4),
];

console.log(polygonsOverlap(pa, pb));

let m, n;
m = CoordinateConverter.convert(new DutchGrid(155000, 463000), CoordinateConverter.getCoordinateSystem('EPSG:25832'));
console.log(m);
n = CoordinateConverter.convert(m, CoordinateConverter.getCoordinateSystem('EPSG:28992'));
console.log(n);

m = CoordinateConverter.convert(new DutchGrid(155000, 463000), CoordinateConverter.getCoordinateSystem('EPSG:25832'));
console.log(m);
n = CoordinateConverter.convert(m, CoordinateConverter.getCoordinateSystem('EPSG:28992'));
console.log(n);
