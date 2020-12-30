import Action from "./Action";
import Cutout from "../Main/Cutout";

export default class ChangeCutoutManualGridAction implements Action {

    private readonly oldValue: number;

    constructor(private cutout: Cutout<any, any, any>, private key: 'base_x'|'delta_x'|'base_y'|'delta_y', private newValue: number) {
        const grid = this.cutout.getGrid();
        this.oldValue = grid.getCustomGridSpec()[this.key];
    }

    public apply() {
        const grid = this.cutout.getGrid();
        grid.getCustomGridSpec()[this.key] = this.newValue;
    }

    public revert() {
        const grid = this.cutout.getGrid();
        grid.getCustomGridSpec()[this.key] = this.oldValue;
    }

    public merge(newAction: Action): boolean {
        if(!(newAction instanceof ChangeCutoutManualGridAction) || newAction.key !== this.key || newAction.oldValue !== this.newValue) {
            return false;
        }

        if((this.newValue > this.oldValue) !== (newAction.newValue > newAction.oldValue)) {
            return false;
        }

        this.newValue = newAction.newValue;
        this.apply();

        return true;
    }
}
