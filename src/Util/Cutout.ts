import Coordinate from "../Coordinates/Coordinate";
import {container} from "../inversify.config";
import Conversion from "../Conversion/Conversion";
import {TYPES} from "../types";
import {millimeter, Paper} from "./Paper";

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
    ProjectionCoordinate extends Coordinate,
    UiMapCoordinate extends Coordinate,
    GridCoordinate extends Coordinate
    > {
    readonly id: number;
    name: string;
    options: CutoutOptions;

    anchorProjection: ProjectionCoordinate;
    anchorUiMapCoordinate: UiMapCoordinate;

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

    constructor(id: number, paper: Paper, anchorUiMap: UiMapCoordinate) {
        this.id = id;
        this.paper = paper;
        this.options = Object.assign({}, Cutout.defaultCutoutOptions);
        this.anchorUiMapCoordinate = anchorUiMap;

        const uiMapToProjectionConversion = container.getAll<Conversion<UiMapCoordinate, ProjectionCoordinate>>(TYPES.Conversion);
        console.log(uiMapToProjectionConversion)
        //this.anchorProjection = uiMapToProjectionConversion.convert(anchorUiMap);
    }

}
