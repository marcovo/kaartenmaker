import Cutout from "../Main/Cutout";
import Action from "./Action";
import UserInterface from "../Main/UserInterface";

export default class DeleteCutoutAction implements Action {

    readonly position: number;

    constructor(
        readonly cutout: Cutout<any, any, any, any>,
        readonly userInterface: UserInterface
    ) {
        this.position = userInterface.getCutouts().indexOf(cutout);

        if(this.position === -1) {
            throw new Error('Invalid position');
        }
    }

    public apply() {
        this.userInterface.detachCutout(this.cutout);
    }

    public revert() {
        this.userInterface.attachCutout(this.cutout, this.position);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
