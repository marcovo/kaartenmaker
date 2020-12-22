import Action from "./Action";
import Cutout from "../Main/Cutout";
import WmsProjection from "../Projection/WmsProjection";

export default class ChangeCutoutDpiAction implements Action {

    private readonly oldDpi: number;

    constructor(private cutout: Cutout<any, any, any>, private newDpi: number) {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection)) {
            throw new Error('Can only change DPI for WMS projection');
        }
        this.oldDpi = projection.getDpi();
    }

    public apply() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection)) {
            throw new Error('Can only set DPI for WMS projection');
        }
        projection.setDpi(this.newDpi);
    }

    public revert() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmsProjection)) {
            throw new Error('Can only set DPI for WMS projection');
        }
        projection.setDpi(this.oldDpi);
    }

    public merge(newAction: Action): boolean {
        if(!(newAction instanceof ChangeCutoutDpiAction) || newAction.oldDpi !== this.newDpi) {
            return false;
        }

        if((this.newDpi > this.oldDpi) !== (newAction.newDpi > newAction.oldDpi)) {
            return false;
        }

        this.newDpi = newAction.newDpi;
        this.apply();

        return true;
    }
}
