import Coordinate from "../Coordinates/Coordinate";
import Paper, {millimeter} from "../Util/Paper";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import Projection from "../Projection/Projection";
import Grid from "./Grid";
import Cutout from "./Cutout";
import UserInterface from "./UserInterface";
import MapImageProvider from "../Util/MapImageProvider";

export type CutoutOptions = {
    margin_top: millimeter,
    margin_right: millimeter,
    margin_bottom: millimeter,
    margin_left: millimeter,
    display_coords_top: boolean,
    display_coords_right: boolean,
    display_coords_bottom: boolean,
    display_coords_left: boolean,
    display_name: boolean,
    display_scale: boolean,
    rotate_y_coords: boolean,
};

type Color = string;

export default class CutoutTemplate<
    WorkspaceCoordinate extends Coordinate & LeafletConvertibleCoordinate,
    ProjectionCoordinate extends Coordinate,
    WorkspaceCoordinateSystem extends CoordinateSystem<WorkspaceCoordinate> & LeafletConvertibleCoordinateSystem<WorkspaceCoordinate>
    > {
    static idIncrement: number = 0;

    readonly id: number;
    options: CutoutOptions;

    anchorWorkspaceCoordinate: WorkspaceCoordinate;

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
        display_name: true,
        display_scale: true,
        rotate_y_coords: false,
    };

    constructor(
        protected paper: Paper,
        anchorWorkspace: WorkspaceCoordinate,
        readonly workspaceCoordinateSystem: WorkspaceCoordinateSystem,
        protected projection: Projection<ProjectionCoordinate, MapImageProvider>,
        protected grid: Grid<Coordinate> = null,
        public name: string = null,
    ) {
        this.id = CutoutTemplate.idIncrement++;
        this.options = Object.assign({}, CutoutTemplate.defaultCutoutOptions);

        if(this.grid === null) {
            this.grid = new Grid(this.projection.getMapImageProvider().getDefaultGridCoordinateSystem());
        }

        this.setAnchorWorkspaceCoordinate(anchorWorkspace);
    }

    getPaper(): Paper {
        return this.paper;
    }

    getProjection(): Projection<ProjectionCoordinate, MapImageProvider> {
        return this.projection;
    }

    setProjection(projection: Projection<ProjectionCoordinate, MapImageProvider>) {
        this.projection = projection;
        this.projection.setAnchor(this.anchorWorkspaceCoordinate);
    }

    getGrid(): Grid<Coordinate> {
        return this.grid;
    }

    makeCutout(userInterface: UserInterface): Promise<Cutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem>> {
        return new Promise<Cutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem>>(((resolve, reject) => {
            const cutout = new Cutout(
                userInterface,
                this.getPaper(),
                this.anchorWorkspaceCoordinate.clone(),
                this.workspaceCoordinateSystem,
                this.getProjection().clone(),
                new Grid(this.getGrid().coordinateSystem)
            );

            cutout.getProjection().initialize().then(() => {
                resolve(cutout);
            })
        }));
    }

    setAnchorWorkspaceCoordinate(c: WorkspaceCoordinate) {
        this.anchorWorkspaceCoordinate = c;
        this.projection.setAnchor(this.anchorWorkspaceCoordinate);
    }
}
