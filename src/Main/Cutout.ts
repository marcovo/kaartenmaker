import Coordinate from "../Coordinates/Coordinate";
import Paper, {millimeter} from "../Util/Paper";
import * as L from 'leaflet';
import CoordinateSystem from "../Coordinates/CoordinateSystem";
import {Point, walkLine} from "../Util/Math";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import Map from "./Map";
import * as _ from "lodash";
import * as $ from "jquery";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import Projection from "../Projection/Projection";
import UserInterface from "./UserInterface";
import CoordinateConverter from "../Util/CoordinateConverter";
import Grid from "./Grid";
import MoveCutoutAction from "../ActionHistory/MoveCutoutAction";
import CutoutTemplate from "./CutoutTemplate";
import Printer from "./Printer";
import MapImageProvider from "../Projection/MapImageProvider";
import {Serialization} from "./Serializer";
import Container from "./Container";
import WmsProjection from "../Projection/WmsProjection";
import WmtsProjection from "../Projection/WmtsProjection";

export default class Cutout<
    WorkspaceCoordinate extends Coordinate & LeafletConvertibleCoordinate,
    ProjectionCoordinate extends Coordinate,
    WorkspaceCoordinateSystem extends CoordinateSystem<WorkspaceCoordinate> & LeafletConvertibleCoordinateSystem<WorkspaceCoordinate>
    > extends CutoutTemplate<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem> {

    mapPolygonWorkspace: WorkspaceCoordinate[];
    mapPolygonProjection: ProjectionCoordinate[];

    leafletPolygon: L.polygon;
    visibleOnMap: boolean = false;

    static readonly pointsOnEdge = 5;

    constructor(
        readonly userInterface: UserInterface,
        paper: Paper,
        anchorWorkspace: WorkspaceCoordinate,
        workspaceCoordinateSystem: WorkspaceCoordinateSystem,
        projection: Projection<ProjectionCoordinate, MapImageProvider>,
        grid: Grid<Coordinate> = null
    ) {
        super(paper, anchorWorkspace, workspaceCoordinateSystem, projection, grid);

        this.projection.attach(this);
        this.grid.attach(this);
    }

    setProjection(projection: Projection<ProjectionCoordinate, MapImageProvider>) {
        super.setProjection(projection);
        this.projection.attach(this);
        this.updateMap();
    }

    setPaper(paper: Paper) {
        this.paper = paper;
        this.updateMap();
    }

    clone(): Cutout<WorkspaceCoordinate, ProjectionCoordinate, WorkspaceCoordinateSystem> {
        return new Cutout(
            this.userInterface,
            this.getPaper(),
            this.anchorWorkspaceCoordinate.clone(),
            this.workspaceCoordinateSystem,
            this.getProjection().clone(),
            new Grid(this.getGrid().coordinateSystem)
        );
    }

    serialize(): Serialization {
        return {
            name: this.name,
            options: Object.assign({}, this.options),
            anchor: {
                system: this.anchorWorkspaceCoordinate.name,
                x: this.anchorWorkspaceCoordinate.getX(),
                y: this.anchorWorkspaceCoordinate.getY(),
            },
            color: this.color,
            visibleOnMap: this.visibleOnMap, // This is not immediately honored, but it is later enforced in userInterface.setFromUnserialize()
            paper: this.paper.name,
            projection: this.projection.serialize(),
            grid: this.grid.serialize(),
        };
    }

    static unserialize(serialized: Serialization, userInterface: UserInterface): Promise<Cutout<any, any, any>> {
        return new Promise(((resolve, reject) => {
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

            const cutout = new Cutout(
                userInterface,
                Container.getPaper(serialized.paper || 'A4L'),
                // @ts-ignore
                coordinate,
                coordinateSystem,
                projection,
                Grid.unserialize(serialized.grid),
            );

            cutout.name = serialized.name;
            cutout.color = serialized.color;
            cutout.visibleOnMap = serialized.visibleOnMap;
            cutout.options = Object.assign({}, cutout.options, serialized.options);

            cutout.getProjection().initialize().then(() => {
                resolve(cutout);
            })
        }));
    }

    computeProjectionPolygon(anchorProjection: ProjectionCoordinate): ProjectionCoordinate[] {
        const width: millimeter = this.paper.width - this.options.margin_left - this.options.margin_right;
        const height: millimeter = this.paper.height - this.options.margin_top - this.options.margin_bottom;

        const scale = this.projection.getScale();
        const topRight = this.projection.coordinateSystem.make(anchorProjection.getX() + width*scale/1000, anchorProjection.getY());
        const bottomRight = this.projection.coordinateSystem.make(anchorProjection.getX() + width*scale/1000, anchorProjection.getY() + height*scale/1000);
        const bottomLeft = this.projection.coordinateSystem.make(anchorProjection.getX(), anchorProjection.getY() + height*scale/1000);

        return [
            anchorProjection,
            topRight,
            bottomRight,
            bottomLeft,
        ];
    }

    computeWorkspacePolygon(mapPolygonProjection): WorkspaceCoordinate[] {
        const mapPolygonWorkspace = [];

        for(let i=0; i<4; i++) {
            walkLine(
                this.projection.coordinateSystem,
                mapPolygonProjection[i],
                mapPolygonProjection[(i+1) % 4],
                Cutout.pointsOnEdge,
                (c: ProjectionCoordinate, step): void => {
                    if(step < Cutout.pointsOnEdge-1) {
                        mapPolygonWorkspace.push(CoordinateConverter.convert(c, this.workspaceCoordinateSystem));
                    }
                }
            );
        }
        return mapPolygonWorkspace;
    }

    determineWorkspacePolygon(): void {
        this.mapPolygonProjection = this.computeProjectionPolygon(this.projection.anchor);

        this.mapPolygonWorkspace = this.computeWorkspacePolygon(this.mapPolygonProjection);
    }

    addToMap(map: Map) {
        this.determineWorkspacePolygon();

        const coords = _.map(this.mapPolygonWorkspace, (c: WorkspaceCoordinate): L.LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon = L.polygon(coords, {color: this.color, weight: 3, draggable: true});

        this.leafletPolygon.addTo(map.getLeafletMap());
        this.visibleOnMap = true;
        this.leafletPolygon.dragging.enable();

        this.leafletPolygon.on('prelatlng', (evt) => {
            if(evt.originalEvent.ctrlKey) {
                return;
            }

            const thisCornerLL = CoordinateConverter.convert(
                this.workspaceCoordinateSystem.fromLeaflet(evt.latlngs[0]),
                this.projection.coordinateSystem
            );

            const width: millimeter = this.paper.width - this.options.margin_left - this.options.margin_right;
            const height: millimeter = this.paper.height - this.options.margin_top - this.options.margin_bottom;
            const scale = this.projection.getScale();
            const thisCornerHH = this.projection.coordinateSystem.make(thisCornerLL.getX() + width * scale / 1000, thisCornerLL.getY() + height * scale / 1000);

            const thisLeft = thisCornerLL.getX();
            const thisRight = thisCornerHH.getX();
            const thisBottom = thisCornerLL.getY();
            const thisTop = thisCornerHH.getY();

            const factor = Math.pow(2,map.getLeafletMap().getZoom()-12);
            let diffX = 1000/factor;
            let diffY = 1000/factor;
            let maxDiffPerpHor = (thisRight - thisLeft)/2;
            let maxDiffPerpVer = (thisTop - thisBottom)/2;

            let newCornerX = null;
            let newCornerY = null;

            this.userInterface.getCutouts().forEach((cutout) => {
                if(cutout.id === this.id) {
                    return;
                }

                if(!cutout.visibleOnMap) {
                    return;
                }

                if(!cutout.mapPolygonProjection[0].belongsTo(this.projection.coordinateSystem)) {
                    return;
                }

                const otherLeft = cutout.mapPolygonProjection[0].getX();
                const otherRight = cutout.mapPolygonProjection[2].getX();
                const otherBottom = cutout.mapPolygonProjection[0].getY();
                const otherTop = cutout.mapPolygonProjection[2].getY();

                // Opposite-edge diffs ('outer')
                const outDiffTop = Math.abs(otherBottom - thisTop);
                const outDiffBottom = Math.abs(otherTop - thisBottom);
                const outDiffLeft = Math.abs(otherRight - thisLeft);
                const outDiffRight = Math.abs(otherLeft - thisRight);

                // Same-edge diffs ('inner')
                const inDiffTop = Math.abs(otherTop - thisTop);
                const inDiffBottom = Math.abs(otherBottom - thisBottom);
                const inDiffLeft = Math.abs(otherLeft - thisLeft);
                const inDiffRight = Math.abs(otherRight - thisRight);

                const minDiffVer = Math.min(outDiffTop, outDiffBottom, inDiffTop, inDiffBottom);
                const minDiffHor = Math.min(outDiffLeft, outDiffRight, inDiffLeft, inDiffRight);

                if(minDiffHor < maxDiffPerpHor) {
                    if(outDiffTop < diffY) {
                        newCornerY = otherBottom - (thisTop - thisBottom);
                        diffY = outDiffTop;
                    }
                    if(outDiffBottom < diffY) {
                        newCornerY = otherTop;
                        diffY = outDiffBottom;
                    }
                    if(inDiffTop < diffY) {
                        newCornerY = otherTop - (thisTop - thisBottom);
                        diffY = inDiffTop;
                    }
                    if(inDiffBottom < diffY) {
                        newCornerY = otherBottom;
                        diffY = inDiffBottom;
                    }
                }

                if(minDiffVer < maxDiffPerpVer) {
                    if(outDiffLeft < diffX) {
                        newCornerX = otherRight;
                        diffX = outDiffLeft;
                    }
                    if(outDiffRight < diffX) {
                        newCornerX = otherLeft - (thisRight - thisLeft);
                        diffX = outDiffRight;
                    }
                    if(inDiffLeft < diffX) {
                        newCornerX = otherLeft;
                        diffX = inDiffLeft;
                    }
                    if(inDiffRight < diffX) {
                        newCornerX = otherRight - (thisRight - thisLeft);
                        diffX = inDiffRight;
                    }
                }
            });

            if(newCornerX || newCornerY) {
                newCornerX = newCornerX || thisLeft;
                newCornerY = newCornerY || thisBottom;

                const newCorner = this.projection.coordinateSystem.make(newCornerX, newCornerY);

                const newPolygon = this.computeWorkspacePolygon(this.computeProjectionPolygon(newCorner));

                const newLeafletPolygon = _.map(newPolygon, (c: WorkspaceCoordinate): L.LatLng => {
                    return c.toLeaflet();
                });

                evt.latlngs.splice(0, evt.latlngs.length, ...newLeafletPolygon);
            }
        });

        // Events
        this.leafletPolygon.on('mouseover', () => {
            this.mouseover();
        });

        this.leafletPolygon.on('mouseout', () => {
            this.mouseout();
        });

        this.leafletPolygon.on('dragend', () => {
            this.userInterface.actionHistory.addAction(new MoveCutoutAction(
                this,
                this.workspaceCoordinateSystem.fromLeaflet(this.leafletPolygon.getLatLngs()[0][0])
            ));
        });

        this.leafletPolygon.on('contextmenu', (evt) => {
            this.userInterface.openCutoutDropdownMenu(this, evt);
        });

        this.mouseout();
    }

    removeFromMap(map: Map) {
        if(this.leafletPolygon !== null) {
            map.getLeafletMap().removeLayer(this.leafletPolygon);
        }
        this.visibleOnMap = false;
    }

    toggleVisibleOnMap(map: Map, visible: boolean = null) {
        if(visible === null) {
            visible = !this.visibleOnMap;
        }

        if(visible && !this.visibleOnMap) {
            this.leafletPolygon.addTo(map.getLeafletMap());
            this.visibleOnMap = true;
        } else if(!visible && this.visibleOnMap) {
            this.removeFromMap(map);
        }
    }

    updateMap() {
        this.determineWorkspacePolygon();

        const coords = _.map(this.mapPolygonWorkspace, (c: WorkspaceCoordinate): L.LatLng => {
            return c.toLeaflet();
        });

        this.leafletPolygon.setLatLngs(coords);
    }

    print(): Promise<void> {
        return (new Printer(this)).print();
    }

    mouseover() {
        this.leafletPolygon.setStyle({weight: 5, opacity: 0.7, fillOpacity: 0.3});
        $('#cutout_' + this.id).addClass('hover');
    };

    mouseout() {
        this.leafletPolygon.setStyle({weight: 3, opacity: 0.5, fillOpacity: 0.2});
        $('#cutout_' + this.id).removeClass('hover');
    };


}
