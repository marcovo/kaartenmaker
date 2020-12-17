import Action from "./Action";
import Cutout from "../Main/Cutout";
import Projection from "../Main/Projection";
import Coordinate from "../Coordinates/Coordinate";

export default class ChangeCutoutProjectionAction<C extends Coordinate> implements Action {

    private readonly oldProjection: Projection<C>;

    constructor(private cutout: Cutout<any, any, any>, private newProjection: Projection<C>) {
        this.oldProjection = this.cutout.getProjection();
    }

    public apply() {
        this.cutout.setProjection(this.newProjection);
    }

    public revert() {
        this.cutout.setProjection(this.oldProjection);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
