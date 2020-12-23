import Action from "./Action";
import Cutout from "../Main/Cutout";
import Paper from "../Util/Paper";

export default class ChangeCutoutPaperAction implements Action {

    private readonly oldPaper: Paper;

    constructor(private cutout: Cutout<any, any, any>, private newPaper: Paper) {
        this.oldPaper = this.cutout.getPaper();
    }

    public apply() {
        this.cutout.setPaper(this.newPaper);
    }

    public revert() {
        this.cutout.setPaper(this.oldPaper);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
