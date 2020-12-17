import Action from "./Action";
import Cutout from "../Main/Cutout";

export default class ChangeCutoutScaleAction implements Action {

    private readonly oldScale: number;

    constructor(private cutout: Cutout<any, any, any>, private newScale: number) {
        this.oldScale = this.cutout.getProjection().getScale();
    }

    public apply() {
        this.cutout.getProjection().setScale(this.newScale);
    }

    public revert() {
        this.cutout.getProjection().setScale(this.oldScale);
    }

    public merge(newAction: Action): boolean {
        if(!(newAction instanceof ChangeCutoutScaleAction) || newAction.oldScale !== this.newScale) {
            return false;
        }

        if((this.newScale > this.oldScale) !== (newAction.newScale > newAction.oldScale)) {
            return false;
        }

        this.newScale = newAction.newScale;
        this.apply();

        return true;
    }
}
