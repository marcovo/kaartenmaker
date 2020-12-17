import Wms from './Util/Wms';
import WGS84, {WGS84System} from "./Coordinates/WGS84";
import DutchGrid, {DutchGridSystem} from "./Coordinates/DutchGrid";
import WGS84_DutchGrid from "./Conversion/WGS84_DutchGrid";
import {polygonsOverlap} from "./Util/Math";
import UserInterface from "./Main/UserInterface";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import Projection from "./Main/Projection";
import Container from "./Main/Container";
import Cutout from "./Main/Cutout";
import WGS84_UTM from "./Conversion/WGS84_UTM";
import UTM, {UTMSystem} from "./Coordinates/UTM";
import CoordinateConverter from "./Util/CoordinateConverter";
import {A4L} from "./Util/Paper";
import CutoutTemplate from "./Main/CutoutTemplate";
require('./components/CutoutSettingsModal.vue');

CoordinateConverter.registerCoordinateSystem(new WGS84System());
CoordinateConverter.registerCoordinateSystem(new DutchGridSystem());
CoordinateConverter.registerCoordinateSystem(new UTMSystem());

Container.registerWms(new Wms(
    'nl_kad_25',
    'Kadaster (NL) 1:25.000',
    'https://geodata.nationaalgeoregister.nl/top25raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    25000,
    { min: 12500, max: 50000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top25raster',
    }
));

Container.registerWms(new Wms(
    'nl_kad_50',
    'Kadaster (NL) 1:50.000',
    'https://geodata.nationaalgeoregister.nl/top50raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    50000,
    { min: 25000, max: 100000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top50raster',
    }
));

Container.registerWms(new Wms(
    'nl_kad_100',
    'Kadaster (NL) 1:100.000',
    'https://geodata.nationaalgeoregister.nl/top100raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    100000,
    { min: 50000, max: 200000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top100raster',
    }
));

Container.registerWms(new Wms(
    'nl_kad_250',
    'Kadaster (NL) 1:250.000',
    'https://geodata.nationaalgeoregister.nl/top250raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    250000,
    { min: 125000, max: 500000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top250raster',
    }
));

Container.registerWms(new Wms(
    'nl_kad_500',
    'Kadaster (NL) 1:500.000',
    'https://geodata.nationaalgeoregister.nl/top500raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    500000,
    { min: 250000, max: 1000000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top500raster',
    }
));

Container.registerWms(new Wms(
    'nl_kad_1000',
    'Kadaster (NL) 1:1.000.000',
    'https://geodata.nationaalgeoregister.nl/top1000raster/wms',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    1000000,
    { min: 500000, max: 2000000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top1000raster',
    }
));

Container.registerWms(new Wms(
    'de_rp_25',
    'Rheinland-Pfalz (DE) 1:25.000',
    'https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    25000,
    { min: 12500, max: 50000 },
    {
        // Wanted to use EPSG:4258 (ETRS89) here as that is used in the original maps in germany. However,
        // the WMS data is returned in a rectangular grid while the original maps obey the distortion introduced
        // by the ETRS89 system; making the map 1mm smaller in both the top left and top right corner when compared to
        // the bottom left and bottom right corner. The WMS point seems to return exactly the same area, but in a
        // rectangular fashion instead of the trapezium(-ish?) shape we desire. This may distort our maps, so we do
        // not (yet) do down that path.

        // Instead, we choose to use UTM as our base, making the maps more like the dutch maps; rectangular maps
        // containing a grid parallel to the map.
        CRS: 'EPSG:25832',
        layers: 'rp_dtk25',
    }
));

Container.registerCutoutTemplate(new CutoutTemplate<any, any, any>(
    new A4L(),
    new WGS84(52, 5),
    new WGS84System(),
    new Projection('nl_kad_25'),
    null,
    '(NL) Kadaster 1:25.000'
));

Container.registerCutoutTemplate(new CutoutTemplate<any, any, any>(
    new A4L(),
    new WGS84(50, 7),
    new WGS84System(),
    new Projection('de_rp_25'),
    null,
    '(DE) Rheinland-Pfalz 1:25.000'
));

const userInterface = new UserInterface();





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
