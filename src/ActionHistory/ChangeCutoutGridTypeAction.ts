import Action from "./Action";
import Cutout from "../Main/Cutout";
import {GridSpec} from "../Main/Grid";

export default class ChangeCutoutGridTypeAction implements Action {

    private readonly oldCustomGridSpec: GridSpec|null;
    private readonly newCustomGridSpec: GridSpec|null;

    constructor(private cutout: Cutout<any, any, any>, private newSetting: 'auto'|'manual') {
        const grid = this.cutout.getGrid();
        this.oldCustomGridSpec = grid.getCustomGridSpec();

        if(newSetting === 'manual') {
            this.newCustomGridSpec = grid.computeGridSpec();
        } else {
            this.newCustomGridSpec = null;
        }
    }

    public apply() {
        const grid = this.cutout.getGrid();
        grid.setCustomGridSpec(this.newCustomGridSpec);
    }

    public revert() {
        const grid = this.cutout.getGrid();
        grid.setCustomGridSpec(this.oldCustomGridSpec);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
