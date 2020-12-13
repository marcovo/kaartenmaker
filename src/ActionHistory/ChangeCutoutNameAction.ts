import Action from "./Action";
import Cutout from "../Main/Cutout";

export default class ChangeCutoutNameAction implements Action {

    private readonly oldName: string;

    constructor(private cutout: Cutout<any, any, any, any>, private newName: string) {
        this.oldName = this.cutout.name;
    }

    public apply() {
        this.cutout.name = this.newName;
    }

    public revert() {
        this.cutout.name = this.oldName;
    }

    public merge(newAction: Action): boolean {
        if(!(newAction instanceof ChangeCutoutNameAction) || newAction.oldName !== this.newName) {
            return false;
        }

        if((this.newName.length > this.oldName.length) !== (newAction.newName.length > newAction.oldName.length)) {
            return false;
        }

        this.newName = newAction.newName;
        this.apply();

        return true;
    }
}
