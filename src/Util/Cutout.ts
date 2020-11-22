import Coordinate from "../Coordinates/Coordinate";
import Conversion from "../Conversion/Conversion";
import {millimeter, Paper} from "./Paper";
import DutchGrid from "../Coordinates/DutchGrid";
import { Map, polygon, LatLng } from 'leaflet';
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import {walkLine} from "./Math";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import * as _ from "lodash";

export type CutoutOptions = {
    margin_top: millimeter,
    margin_right: millimeter,
    margin_bottom: millimeter,
    margin_left: millimeter,
    display_coords_top: boolean,
    display_coords_right: boolean,
    display_coords_bottom: boolean,
    display_coords_left: boolean,
    rotate_y_coords: boolean,
    display_ticks: boolean,
    display_sub_ticks: boolean,
};

type Color = string;

export default class Cutout<
    UiMapCoordinate extends Coordinate & LeafletConvertibleCoordinate,
    ProjectionCoordinate extends Coordinate,
    GridCoordinate extends Coordinate,
    UiMapCoordinateSystem extends CoordinateSystem<UiMapCoordinate>,
    ProjectionCoordinateSystem extends CoordinateSystem<ProjectionCoordinate>,
    GridCoordinateSystem extends CoordinateSystem<GridCoordinate>,
    > {
    readonly id: number;
    name: string;
    options: CutoutOptions;

    anchorUiMapCoordinate: UiMapCoordinate;
    anchorProjection: ProjectionCoordinate;

    uiMapCoordinateSystem: UiMapCoordinateSystem;
    projectionCoordinateSystem: ProjectionCoordinateSystem;
    gridCoordinateSystem: GridCoordinateSystem;

    conversionProjection: Conversion<UiMapCoordinate, ProjectionCoordinate>;
    conversionGrid: Conversion<UiMapCoordinate, GridCoordinate>;

    mapPolygonUi: UiMapCoordinate[];
    mapPolygonProjection: ProjectionCoordinate[];

    leafletPolygon: polygon;

    paper: Paper;
    color: Color;

    static defaultCutoutOptions: CutoutOptions = {
        margin_top: 10,
        margin_right: 10,
        margin_bottom: 10,
        margin_left: 10,
        display_coords_top: true,
        display_coords_right: true,
        display_coords_bottom: true,
        display_coords_left: true,
        rotate_y_coords: true,
        display_ticks: true,
        display_sub_ticks: true,
    };

    constructor(
        id: number,
        paper: Paper,
        anchorUiMap: UiMapCoordinate,
        uiMapCoordinateSystem: UiMapCoordinateSystem,
        projectionCoordinateSystem: ProjectionCoordinateSystem,
        gridCoordinateSystem: GridCoordinateSystem,
        conversionProjection: Conversion<UiMapCoordinate, ProjectionCoordinate>,
        conversionGrid: Conversion<UiMapCoordinate, GridCoordinate>
    ) {
        this.id = id;
        this.paper = paper;
        this.options = Object.assign({}, Cutout.defaultCutoutOptions);
        this.anchorUiMapCoordinate = anchorUiMap;

        this.uiMapCoordinateSystem = uiMapCoordinateSystem;
        this.projectionCoordinateSystem = projectionCoordinateSystem;
        this.gridCoordinateSystem = gridCoordinateSystem;

        this.conversionProjection = conversionProjection;
        this.conversionGrid = conversionGrid;

        this.anchorProjection = this.conversionProjection.convert(this.anchorUiMapCoordinate);

        this.color = 'red';
    }

    determineMapPolygon(): void {
        const width: millimeter = this.paper.width - this.options.margin_left - this.options.margin_right;
        const height: millimeter = this.paper.height - this.options.margin_top - this.options.margin_bottom;

        if(!(this.anchorProjection instanceof DutchGrid)) {
            // Only for dutch grid at the moment...
            throw new Error();
        }

        const topRight = new DutchGrid(this.anchorProjection.x + width, this.anchorProjection.y);
        const bottomRight = new DutchGrid(this.anchorProjection.x + width, this.anchorProjection.y + height);
        const bottomLeft = new DutchGrid(this.anchorProjection.x, this.anchorProjection.y + height);

        this.mapPolygonProjection = [
            this.anchorProjection,
            // @ts-ignore
            topRight,
            // @ts-ignore
            bottomRight,
            // @ts-ignore
            bottomLeft,
        ];
    }

    determineUiMapPolygon(): void {
        this.determineMapPolygon();

        const pointsOnEdge = 5;
        this.mapPolygonUi = [];

        for(let i=0; i<4; i++) {
            walkLine(
                this.projectionCoordinateSystem,
                this.mapPolygonProjection[i],
                this.mapPolygonProjection[(i+1) % 4],
                pointsOnEdge,
                (c: ProjectionCoordinate, step): void => {
                    if(step < pointsOnEdge-1) {
                        this.mapPolygonUi.push(this.conversionProjection.inverse(c));
                    }
                }
            );
        }
    }

    addToMap(map: Map) {
        this.determineUiMapPolygon();

        const coords = _.map(this.mapPolygonUi, (c: UiMapCoordinate): LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon = polygon(coords, {color: this.color, weight: 3});

        this.leafletPolygon.addTo(map);
    }

    updateMap() {
        this.determineUiMapPolygon();

        const coords = _.map(this.mapPolygonUi, (c: UiMapCoordinate): LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon.setLatLngs(coords);
    }

}
