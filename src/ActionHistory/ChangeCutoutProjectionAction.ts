import Action from "./Action";
import Cutout from "../Main/Cutout";
import Projection from "../Projection/Projection";
import Coordinate from "../Coordinates/Coordinate";
import MapImageProvider from "../Projection/MapImageProvider";

export default class ChangeCutoutProjectionAction<C extends Coordinate> implements Action {

    private readonly oldProjection: Projection<C, MapImageProvider>;

    constructor(private cutout: Cutout<any, any, any>, private newProjection: Projection<C, MapImageProvider>) {
        this.oldProjection = this.cutout.getProjection();
    }

    public apply() {
        this.cutout.setProjection(this.newProjection);
        this.oldProjection.detach();
    }

    public revert() {
        this.cutout.setProjection(this.oldProjection);
        this.newProjection.detach();
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
