import Coordinate from "./Coordinate";
import { LatLng } from 'leaflet';

export default interface LeafletConvertibleCoordinate extends Coordinate {

    toLeaflet(): LatLng;

}
