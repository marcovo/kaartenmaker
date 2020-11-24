import Wms, {WmsKadaster25} from './Util/Wms';
import WGS84, {WGS84System} from "./Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import Cutout from "./Main/Cutout";
import {A4L} from "./Util/Paper";
import {polygonsOverlap} from "./Util/Math";
import UserInterface from "./Main/UserInterface";
import './style.css';
import Projection from "./Main/Projection";


const userInterface = new UserInterface();




const greeting = (person: string) => {
    console.log('Good day ' + person);
};

greeting('Daniel');

const WmsGermany = new Wms('https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi');

const url = WmsGermany.mapUrl({
    'bbox' : '437000,5446000,439000,5448000',
    'width' : '50',
    'height' : '50',
})

console.log(url);

const a:WGS84 = new WGS84(51, 4);
const b:DutchGrid = (new WGS84_DutchGrid()).convert(a);
const c = a.toLeaflet();

console.log(a, b, c);
require('leaflet');
require('leaflet-path-drag')

const cutout = new Cutout(
    1,
    new A4L(),
    new WGS84(51, 4),
    new WGS84System(),
    new DutchGridSystem(),
    new DutchGridSystem(),
    new WGS84_DutchGrid(),
    new WGS84_DutchGrid(),
    new Projection(new WmsKadaster25(), 25000),
);

console.log(cutout);
cutout.determineUiMapPolygon();
console.log(cutout.mapPolygonUi);

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
