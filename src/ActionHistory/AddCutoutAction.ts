import Cutout from "../Main/Cutout";
import Action from "./Action";
import UserInterface from "../Main/UserInterface";

export default class AddCutoutAction implements Action {

    constructor(
        readonly cutout: Cutout<any, any, any>,
        readonly userInterface: UserInterface,
        readonly position: number
    ) {

    }

    public apply() {
        this.userInterface.attachCutout(this.cutout, this.position);
    }

    public revert() {
        this.userInterface.detachCutout(this.cutout);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
