import Wms, {WmsGermanyRP, WmsKadaster25} from './Util/Wms';
import WGS84, {WGS84System} from "./Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import Cutout from "./Main/Cutout";
import {A4L} from "./Util/Paper";
import {polygonsOverlap} from "./Util/Math";
import UserInterface from "./Main/UserInterface";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import Projection from "./Main/Projection";
import WGS84_UTM from "./Conversion/WGS84_UTM";
import UTM, {UTMSystem} from "./Coordinates/UTM";
import CoordinateConverter from "./Util/CoordinateConverter";

CoordinateConverter.registerCoordinateSystem(new WGS84System());
CoordinateConverter.registerCoordinateSystem(new DutchGridSystem());
CoordinateConverter.registerCoordinateSystem(new UTMSystem(0, 0)); // TODO Dummy parameters

const userInterface = new UserInterface();





const WmsGermany = new Wms('https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi');

const url = WmsGermany.mapUrl({
    'bbox' : '437000,5446000,439000,5448000',
    'width' : '50',
    'height' : '50',
})

console.log(url);

const c1 = new WGS84_UTM();
const proj = new Projection<UTM>(new WmsGermanyRP(), 25000);
//const url2 = proj.getWmsUrl([null, c1.convert(new WGS84(49.018895, 8.344384)), null, c1.convert(new WGS84(49.002492, 8.288909))]);
const url2 = proj.getWmsUrl([null, c1.convert(new WGS84(49.19894, 7.99911)), null, c1.convert(new WGS84(48.99894, 7.66581))]);
console.log(url2);
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
