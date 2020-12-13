import Action from "./Action";
import Cutout from "../Main/Cutout";
import Coordinate from "../Coordinates/Coordinate";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";

export default class MoveCutoutAction<C extends Coordinate & LeafletConvertibleCoordinate> implements Action {

    private readonly oldCoordinate: C;

    constructor(private cutout: Cutout<C, any, any, any>, private newCoordinate: C) {
        this.oldCoordinate = this.cutout.anchorWorkspaceCoordinate;
    }

    public apply() {
        this.cutout.setAnchorWorkspaceCoordinate(this.newCoordinate);
        this.cutout.updateMap();
    }

    public revert() {
        this.cutout.setAnchorWorkspaceCoordinate(this.oldCoordinate);
        this.cutout.updateMap();
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
