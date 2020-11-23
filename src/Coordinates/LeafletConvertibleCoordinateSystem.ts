import Coordinate from "./Coordinate";
import * as L from 'leaflet';

export default interface LeafletConvertibleCoordinateSystem<C extends Coordinate> {
    fromLeaflet(source: L.LatLng): C;
}
