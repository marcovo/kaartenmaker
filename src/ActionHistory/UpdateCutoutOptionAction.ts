import Action from "./Action";
import Cutout from "../Main/Cutout";

export default class UpdateCutoutOptionAction<Type> implements Action {

    static readonly updateMapOptions = ['margin_top_printable', 'margin_left_printable', 'margin_right_printable', 'margin_bottom_printable', 'margin_top_nonprintable', 'margin_left_nonprintable', 'margin_right_nonprintable', 'margin_bottom_nonprintable'];
    static readonly mergableOptions = ['margin_top_printable', 'margin_left_printable', 'margin_right_printable', 'margin_bottom_printable', 'margin_top_nonprintable', 'margin_left_nonprintable', 'margin_right_nonprintable', 'margin_bottom_nonprintable'];

    private readonly oldValue: Type;

    constructor(
        private cutout: Cutout<any, any, any>,
        private key: string,
        private newValue: Type
    ) {
        this.oldValue = this.cutout.options[this.key];
    }

    public apply() {
        this.cutout.options[this.key] = this.newValue;

        if(UpdateCutoutOptionAction.updateMapOptions.indexOf(this.key) > -1) {
            this.cutout.updateMap();
        }
    }

    public revert() {
        this.cutout.options[this.key] = this.oldValue;

        if(UpdateCutoutOptionAction.updateMapOptions.indexOf(this.key) > -1) {
            this.cutout.updateMap();
        }
    }

    public merge(newAction: Action): boolean {
        if(
            !(newAction instanceof UpdateCutoutOptionAction)
            || newAction.key !== this.key
            || newAction.oldValue !== this.newValue
        ) {
            return false;
        }

        if(UpdateCutoutOptionAction.mergableOptions.indexOf(this.key) === -1) {
            return false;
        }

        this.newValue = newAction.newValue;
        this.apply();

        return true;
    }
}
