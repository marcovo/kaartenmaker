import Action from "./Action";
import Cutout from "../Main/Cutout";
import Projection from "../Projection/Projection";
import Coordinate from "../Coordinates/Coordinate";
import MapImageProvider from "../Projection/MapImageProvider";
import Grid from "../Main/Grid";

export default class ChangeCutoutProjectionAction<C extends Coordinate> implements Action {

    private readonly oldProjection: Projection<C, MapImageProvider>;
    private readonly oldGrid: Grid<Coordinate> = null;
    private readonly newGrid: Grid<Coordinate> = null;

    constructor(private cutout: Cutout<any, any, any>, private newProjection: Projection<C, MapImageProvider>) {
        this.oldProjection = this.cutout.getProjection();

        const newDefaultCoordinateSystem = this.newProjection.getMapImageProvider().getDefaultGridCoordinateSystem();
        const oldDefaultCoordinateSystem = this.oldProjection.getMapImageProvider().getDefaultGridCoordinateSystem();
        if(newDefaultCoordinateSystem.name !== oldDefaultCoordinateSystem.name) {
            this.oldGrid = cutout.getGrid();
            this.newGrid = new Grid(newDefaultCoordinateSystem);
        }
    }

    public apply() {
        this.cutout.setProjection(this.newProjection);
        this.oldProjection.detach();

        if(this.newGrid) {
            this.cutout.setGrid(this.newGrid);
            this.oldGrid.detach();
        }
    }

    public revert() {
        this.cutout.setProjection(this.oldProjection);
        this.newProjection.detach();

        if(this.newGrid) {
            this.cutout.setGrid(this.oldGrid);
            this.newGrid.detach();
        }
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
