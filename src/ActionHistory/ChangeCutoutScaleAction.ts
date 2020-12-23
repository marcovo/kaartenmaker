import Action from "./Action";
import Cutout from "../Main/Cutout";
import WmsProjection from "../Projection/WmsProjection";
import WmtsProjection from "../Projection/WmtsProjection";

export default class ChangeCutoutScaleAction implements Action {

    private readonly oldScale: number;

    constructor(private cutout: Cutout<any, any, any>, private newScale: number) {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection || projection instanceof WmtsProjection)) {
            throw new Error('Can only change scale for WMS/WMTS projection');
        }
        this.oldScale = projection.getScale();
    }

    public apply() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection || projection instanceof WmtsProjection)) {
            throw new Error('Can only set scale for WMS/WMTS projection');
        }
        projection.setScale(this.newScale);
    }

    public revert() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection || projection instanceof WmtsProjection)) {
            throw new Error('Can only set scale for WMS/WMTS projection');
        }
        projection.setScale(this.oldScale);
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
