import Action from "./Action";
import Cutout from "../Main/Cutout";

export default class ChangeCutoutDpiAction implements Action {

    private readonly oldDpi: number;

    constructor(private cutout: Cutout<any, any, any>, private newDpi: number) {
        this.oldDpi = this.cutout.getProjection().getDpi();
    }

    public apply() {
        this.cutout.getProjection().setDpi(this.newDpi);
    }

    public revert() {
        this.cutout.getProjection().setDpi(this.oldDpi);
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
