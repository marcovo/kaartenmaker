import CoordinateConverter from "../Util/CoordinateConverter";
import WGS84, {WGS84System} from "../Coordinates/WGS84";
import {DutchGridSystem} from "../Coordinates/DutchGrid";
import {UTMSystem} from "../Coordinates/UTM";
import Container from "./Container";
import Wms from "../Util/Wms";
import CutoutTemplate from "./CutoutTemplate";
import {A3L, A3P, A4L, A4P, A5L, A5P} from "../Util/Paper";
import WmsProjection from "../Projection/WmsProjection";
import Wmts from "../Util/Wmts";
import WmtsProjection from "../Projection/WmtsProjection";

CoordinateConverter.registerCoordinateSystem(new WGS84System());
CoordinateConverter.registerCoordinateSystem(new DutchGridSystem());
CoordinateConverter.registerCoordinateSystem(new UTMSystem());

Container.registerPaper(new A3L());
Container.registerPaper(new A3P());
Container.registerPaper(new A4L());
Container.registerPaper(new A4P());
Container.registerPaper(new A5L());
Container.registerPaper(new A5P());

// NL, https://www.pdok.nl/geo-services/-/article/dataset-basisregistratie-topografie-brt-topraster
Container.registerMapImageProvider(new Wms(
    'nl_kad_25',
    'Kadaster (NL) 1:25.000',
    'https://geodata.nationaalgeoregister.nl/top25raster/wms',
    '© Kadaster NL TOP25Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    25000,
    {
        CRS: 'EPSG:28992',
        layers: 'top25raster',
    }
));

Container.registerMapImageProvider(new Wms(
    'nl_kad_50',
    'Kadaster (NL) 1:50.000',
    'https://geodata.nationaalgeoregister.nl/top50raster/wms',
    '© Kadaster NL TOP50Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    50000,
    {
        CRS: 'EPSG:28992',
        layers: 'top50raster',
    }
));

Container.registerMapImageProvider(new Wms(
    'nl_kad_100',
    'Kadaster (NL) 1:100.000',
    'https://geodata.nationaalgeoregister.nl/top100raster/wms',
    '© Kadaster NL TOP100Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    100000,
    {
        CRS: 'EPSG:28992',
        layers: 'top100raster',
    }
));

Container.registerMapImageProvider(new Wms(
    'nl_kad_250',
    'Kadaster (NL) 1:250.000',
    'https://geodata.nationaalgeoregister.nl/top250raster/wms',
    '© Kadaster NL TOP250Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    250000,
    {
        CRS: 'EPSG:28992',
        layers: 'top250raster',
    }
));

Container.registerMapImageProvider(new Wms(
    'nl_kad_500',
    'Kadaster (NL) 1:500.000',
    'https://geodata.nationaalgeoregister.nl/top500raster/wms',
    '© Kadaster NL TOP500Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    500000,
    {
        CRS: 'EPSG:28992',
        layers: 'top500raster',
    }
));

Container.registerMapImageProvider(new Wms(
    'nl_kad_1000',
    'Kadaster (NL) 1:1.000.000',
    'https://geodata.nationaalgeoregister.nl/top1000raster/wms',
    '© Kadaster NL TOP1000Raster (CC BY 4.0)',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    1000000,
    {
        CRS: 'EPSG:28992',
        layers: 'top1000raster',
    }
));

Container.registerMapImageProvider(new Wmts(
    'nl_opentopo_wmts',
    'OpenTopo (NL)',
    'https://geodata.nationaalgeoregister.nl/tiles/service/wmts',
    'Bron: J.W. van Aalst, www.opentopo.nl',
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    CoordinateConverter.getCoordinateSystem('EPSG:28992'),
    {
        tilematrixset: 'EPSG:28992',
        layer: 'opentopo',
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
Container.registerMapImageProvider(new Wms(
    'de_rp_5',
    'Rheinland-Pfalz (DE) 1:5.000',
    'https://geo4.service24.rlp.de/wms/dtk5_rp.fcgi',
    '©GeoBasis-DE / LVermGeoRP'+((new Date()).getFullYear())+', dl-de/by-2-0, www.lvermgeo.rlp.de [RP DTK5]',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    5000,
    {
        CRS: 'EPSG:25832',
        layers: 'rp_dtk5',
    }
));

Container.registerMapImageProvider(new Wms(
    'de_rp_25',
    'Rheinland-Pfalz (DE) 1:25.000',
    'https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi',
    '©GeoBasis-DE / LVermGeoRP'+((new Date()).getFullYear())+', dl-de/by-2-0, www.lvermgeo.rlp.de [RP DTK25]',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    25000,
    {
        CRS: 'EPSG:25832',
        layers: 'rp_dtk25',
    }
));

Container.registerMapImageProvider(new Wms(
    'de_rp_50',
    'Rheinland-Pfalz (DE) 1:50.000',
    'https://geo4.service24.rlp.de/wms/rp_dtk50.fcgi',
    '©GeoBasis-DE / LVermGeoRP'+((new Date()).getFullYear())+', dl-de/by-2-0, www.lvermgeo.rlp.de [RP DTK50]',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    50000,
    {
        CRS: 'EPSG:25832',
        layers: 'rp_dtk50',
    }
));

Container.registerMapImageProvider(new Wms(
    'de_rp_100',
    'Rheinland-Pfalz (DE) 1:100.000',
    'https://geo4.service24.rlp.de/wms/rp_dtk100.fcgi',
    '©GeoBasis-DE / LVermGeoRP'+((new Date()).getFullYear())+', dl-de/by-2-0, www.lvermgeo.rlp.de [RP DTK100]',
    CoordinateConverter.getCoordinateSystem('EPSG:25832'),
    100000,
    {
        CRS: 'EPSG:25832',
        layers: 'rp_dtk100',
    }
));

Container.registerCutoutTemplate(new CutoutTemplate<any, any, any>(
    new A4L(),
    new WGS84(52, 5),
    new WGS84System(),
    new WmsProjection('nl_kad_25'),
    null,
    '(NL) Kadaster 1:25.000'
));

Container.registerCutoutTemplate(new CutoutTemplate<any, any, any>(
    new A4L(),
    new WGS84(52, 5),
    new WGS84System(),
    new WmtsProjection('nl_opentopo_wmts', 25000, '10'),
    null,
    '(NL) OpenTopo 1:25.000'
));

Container.registerCutoutTemplate(new CutoutTemplate<any, any, any>(
    new A4L(),
    new WGS84(50, 7),
    new WGS84System(),
    new WmsProjection('de_rp_25'),
    null,
    '(DE) Rheinland-Pfalz 1:25.000'
));
