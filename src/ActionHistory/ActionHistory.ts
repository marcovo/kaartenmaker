import Action from "./Action";

export default class ActionHistory {

    readonly actionLimit = 15;

    private actionList: Action[] = [];
    private pointer: number|null = null;

    constructor() {

    }

    public addAction(action: Action) {
        if(this.pointer !== null && this.actionList.length > this.pointer + 1) {
            this.actionList.splice(this.pointer + 1);
        } else if(this.pointer === null && this.actionList.length > 0) {
            this.actionList.splice(0);
        }

        if(this.pointer !== null && this.actionList[this.pointer].merge(action)) {
            return;
        }

        action.apply();

        this.actionList.push(action);

        if(this.actionList.length > this.actionLimit) {
            this.actionList.shift();
        }

        this.pointer = this.actionList.length - 1;
    }

    public clear() {
        this.actionList = [];
        this.pointer = null;
    }

    public undo() {
        if(this.pointer === null) {
            return;
        }

        const action = this.actionList[this.pointer];
        action.revert();

        this.pointer--;
        if(this.pointer === -1) {
            this.pointer = null;
        }
    }

    public redo() {
        if(this.actionList.length === 0 || (this.pointer !== null && this.pointer >= this.actionList.length - 1)) {
            return;
        }

        this.pointer = (this.pointer === null) ? 0 : this.pointer + 1;

        const action = this.actionList[this.pointer];
        action.apply();
    }
}
