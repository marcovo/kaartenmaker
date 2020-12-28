import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import Grid from "./Grid";
import Cutout from "./Cutout";
import UserInterface from "./UserInterface";
import AbstractCutout from "./AbstractCutout";

export default class CutoutTemplate<
    WorkspaceCoordinate extends Coordinate & LeafletConvertibleCoordinate,
    ProjectionCoordinate extends Coordinate,
    WorkspaceCoordinateSystem extends CoordinateSystem<WorkspaceCoordinate> & LeafletConvertibleCoordinateSystem<WorkspaceCoordinate>
    > extends AbstractCutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem> {

    makeCutout(userInterface: UserInterface): Promise<Cutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem>> {
        return new Promise<Cutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem>>(((resolve, reject) => {
            const cutout = new Cutout(
                userInterface,
                this.getPaper(),
                this.anchorWorkspaceCoordinate.clone(),
                this.workspaceCoordinateSystem,
                this.getProjection().clone(),
                new Grid(this.getGrid().coordinateSystem)
            );

            cutout.options = Object.assign({}, cutout.options, this.options);

            cutout.getProjection().initialize().then(() => {
                resolve(cutout);
            })
        }));
    }
}
