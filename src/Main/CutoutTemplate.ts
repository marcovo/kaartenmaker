import Coordinate from "../Coordinates/Coordinate";
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import Grid from "./Grid";
import Cutout from "./Cutout";
import UserInterface from "./UserInterface";
import AbstractCutout from "./AbstractCutout";
import {Serialization} from "./Serializer";
import CoordinateConverter from "../Util/CoordinateConverter";
import {Point} from "../Util/Math";
import WmsProjection from "../Projection/WmsProjection";
import WmtsProjection from "../Projection/WmtsProjection";
import Container from "./Container";

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
                this.getGrid().clone()
            );

            cutout.options = Object.assign({}, cutout.options, this.options);

            cutout.getProjection().initialize().then(() => {
                resolve(cutout);
            })
        }));
    }

    serialize(): Serialization {
        return {
            name: this.name,
            options: Object.assign({}, this.options),
            anchor: {
                system: this.anchorWorkspaceCoordinate.code,
                x: this.anchorWorkspaceCoordinate.getX(),
                y: this.anchorWorkspaceCoordinate.getY(),
            },
            paper: this.paper.name,
            projection: this.projection.serialize(),
            grid: this.grid.serialize(),
        };
    }

    static unserialize(serialized: Serialization): CutoutTemplate<any, any, any> {
        const coordinateSystem = CoordinateConverter.getCoordinateSystem(serialized.anchor.system);
        const coordinate = coordinateSystem.fromPoint(new Point(serialized.anchor.x, serialized.anchor.y));

        let projection = null;
        if(serialized.projection.type === 'wms') {
            projection = WmsProjection.unserialize(serialized.projection);
        } else if(serialized.projection.type === 'wmts') {
            projection = WmtsProjection.unserialize(serialized.projection);
        } else {
            throw new Error('Invalid projection type');
        }

        const cutoutTemplate = new CutoutTemplate(
            Container.getPaper(serialized.paper || 'A4L'),
            // @ts-ignore
            coordinate,
            coordinateSystem,
            projection,
            Grid.unserialize(serialized.grid),
        );

        cutoutTemplate.name = serialized.name;
        cutoutTemplate.options = Object.assign({}, cutoutTemplate.options, serialized.options);

        return cutoutTemplate;
    }

}
