import "reflect-metadata";
import Wms from './Util/Wms';
import WGS84 from "./Coordinates/WGS84";
import DutchGrid from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import Cutout from "./Util/Cutout";
import {A4L} from "./Util/Paper";

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

const cutout = new Cutout<DutchGrid, WGS84, DutchGrid>(1, new A4L(), new WGS84(51, 4));

console.log(cutout.anchorProjection);
