import CoordinateConverter from "../Util/CoordinateConverter";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import {DutchGridSystem} from "../Coordinates/DutchGrid";
import {UTMSystem} from "../Coordinates/UTM";
import Container from "./Container";
import Wms from "../Util/Wms";
import CutoutTemplate from "./CutoutTemplate";
import {A4L} from "../Util/Paper";
import Projection from "./Projection";

CoordinateConverter.registerCoordinateSystem(new WGS84System());
CoordinateConverter.registerCoordinateSystem(new DutchGridSystem());
CoordinateConverter.registerCoordinateSystem(new UTMSystem());

// NL, https://www.pdok.nl/geo-services/-/article/dataset-basisregistratie-topografie-brt-topraster
Container.registerWms(new Wms(
    'nl_kad_25',
    'Kadaster (NL) 1:25.000',
    'https://geodata.nationaalgeoregister.nl/top25raster/wms',
    '© Kadaster NL TOP25Raster (CC BY 4.0)',
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
    '© Kadaster NL TOP50Raster (CC BY 4.0)',
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
    '© Kadaster NL TOP100Raster (CC BY 4.0)',
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
    '© Kadaster NL TOP250Raster (CC BY 4.0)',
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
    '© Kadaster NL TOP500Raster (CC BY 4.0)',
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
    '© Kadaster NL TOP1000Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    1000000,
    { min: 500000, max: 2000000 },
    {
        CRS: 'EPSG:28992',
        layers: 'top1000raster',
    }
));

// DE RP, https://lvermgeo.rlp.de/de/geodaten/opendata/

// Wanted to use EPSG:4258 (ETRS89) here as that is used in the original maps in germany. However,
// the WMS data is returned in a rectangular grid while the original maps obey the distortion introduced
// by the ETRS89 system; making the map 1mm smaller in both the top left and top right corner when compared to
// the bottom left and bottom right corner. The WMS point seems to return exactly the same area, but in a
// rectangular fashion instead of the trapezium(-ish?) shape we desire. This may distort our maps, so we do
// not (yet) do down that path.

// Instead, we choose to use EPSG:25832 (UTM) as our base, making the maps more like the dutch maps; rectangular maps
// containing a grid parallel to the map.
Container.registerWms(new Wms(
    'de_rp_25',
    'Rheinland-Pfalz (DE) 1:25.000',
    'https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi',
    '©GeoBasis-DE / LVermGeoRP'+((new Date()).getFullYear())+', dl-de/by-2-0, www.lvermgeo.rlp.de [RP DTK 25]',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    25000,
    { min: 12500, max: 50000 },
    {
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
