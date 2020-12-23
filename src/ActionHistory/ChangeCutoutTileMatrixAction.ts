import Action from "./Action";
import Cutout from "../Main/Cutout";
import WmtsProjection from "../Projection/WmtsProjection";

export default class ChangeCutoutTileMatrixAction implements Action {

    private readonly oldTileMatrixId: string;

    constructor(private cutout: Cutout<any, any, any>, private newTileMatrixId: string) {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmtsProjection)) {
            throw new Error('Can only change tile matrix for WMTS projection');
        }
        this.oldTileMatrixId = projection.getTileMatrixId();
    }

    public apply() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmtsProjection)) {
            throw new Error('Can only set tile matrix for WMTS projection');
        }
        projection.setTileMatrixId(this.newTileMatrixId);
    }

    public revert() {
        const projection = this.cutout.getProjection();
        if(!(projection instanceof WmtsProjection)) {
            throw new Error('Can only set tile matrix for WMTS projection');
        }
        projection.setTileMatrixId(this.oldTileMatrixId);
    }

    public merge(newAction: Action): boolean {
        return false;
    }
}
