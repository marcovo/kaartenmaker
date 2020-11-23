import Coordinate from "./Coordinate";
import * as L from 'leaflet';

export default interface LeafletConvertibleCoordinate extends Coordinate {

    toLeaflet(): L.LatLng;

}
