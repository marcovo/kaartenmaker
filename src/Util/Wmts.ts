import CoordinateSystem from "../Coordinates/CoordinateSystem";
import Coordinate from "../Coordinates/Coordinate";
import Container from "../Main/Container";
import MapImageProvider from "./MapImageProvider";
import UserError from "./UserError";
import {findChildNode} from "./functions";

const $ = require( 'jquery' );

export type WmtsParams = {
    version?: string,
    service?: string,
    request?: string,
    layer?: string,
    format?: string,
    tilematrixset?: string,
    tilematrix?: string,
    tilerow?: string,
    tilecol?: string,
};

export type TileMatrix = {
    identifier: string,
    scaleDenominator: number,
    topLeftCorner: [number, number],
    tileWidth: number,
    tileHeight: number,
    matrixWidth: number,
    matrixHeight: number,
};

export default class Wmts implements MapImageProvider {

    private capabilities : Document = null;

    readonly params: WmtsParams;

    constructor(
        readonly name: string,
        readonly title: string,
        readonly url: string,
        readonly copyright: string,
        private coordinateSystem: CoordinateSystem<Coordinate>,
        private defaultGridCoordinateSystem: CoordinateSystem<Coordinate>,
        params: WmtsParams = {}
    ) {
        this.params = Object.assign({
            version: '1.0.0',
            service: 'WMTS',
        }, params);
    }

    getCopyright(): string {
        return this.copyright;
    }

    getCoordinateSystem(): CoordinateSystem<any> {
        return this.coordinateSystem;
    }

    getDefaultGridCoordinateSystem(): CoordinateSystem<Coordinate> {
        return this.defaultGridCoordinateSystem;
    }

    buildUrl(params: WmtsParams) {
        params = Object.assign({}, this.params, params);

        return this.url + '?' + $.param(params);
    }

    getTile(params: WmtsParams) {
        params = Object.assign({}, {
            request: 'GetTile',
            format: 'image/png',
        }, params);

        return this.buildUrl(params);
    }

    getCapabilitiesOrThrow(): Document {
        if(this.capabilities === null) {
            this.fetchCapabilities();
            throw new UserError('De configuratie wordt nog ingeladen, probeer het over een paar seconden opnieuw');
        }

        return this.capabilities;
    }

    fetchCapabilities(): Promise<Document> {
        if(this.capabilities !== null) {
            return Promise.resolve(this.capabilities);
        }

        const url = this.buildUrl({ request: 'GetCapabilities' });

        return Container.getCache().then((cache) => {
            return cache.fetch(url, () => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'text';
                    xhr.onload = function (e) {
                        resolve(xhr.responseText);
                    };
                    xhr.send(null);
                });
            }).then((capabilitiesString) => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(capabilitiesString, 'application/xml');

                if(xml.documentElement.nodeName == "parsererror") {
                    return Promise.reject('Xml parser error');
                } else {
                    this.capabilities = xml;
                    return xml;
                }
            });
        });
    }

    private getTileMatrixSetNode(): Node {
        const xmlDoc = this.getCapabilitiesOrThrow();

        const capabilitiesNode = findChildNode(xmlDoc.getRootNode(), (node: Node) => {
            return node instanceof Element && node.tagName === 'Capabilities';
        });
        if(capabilitiesNode === null) {
            throw new UserError('Could not find tilematrix info (capabilities)');
        }

        const contentsNode = findChildNode(capabilitiesNode, (node: Node) => {
            return node instanceof Element && node.tagName === 'Contents';
        });
        if(contentsNode === null) {
            throw new UserError('Could not find tilematrix info (contents)');
        }

        const tileMatrixSetNode = findChildNode(contentsNode, (node: Node) => {
            if(!(node instanceof Element && node.tagName === 'TileMatrixSet')) {
                return false;
            }
            const identifierNode = findChildNode(node, (childNode: Node) => {
                return childNode instanceof Element && childNode.tagName === 'ows:Identifier';
            });
            return identifierNode !== null && identifierNode.textContent === this.params.tilematrixset;
        });
        if(tileMatrixSetNode === null) {
            throw new UserError('Could not find tilematrix info (tilematrixset)');
        }

        return tileMatrixSetNode;
    }

    getTileMatrixClosestToScale(scale: number): string {
        const tileMatrixSetNode = this.getTileMatrixSetNode();

        let closestTileMatrix: string = null;
        let closestScaleRatio: number = null;
        tileMatrixSetNode.childNodes.forEach((childNode) => {
            if(childNode instanceof Element && childNode.tagName === 'TileMatrix') {
                const scaleNode = findChildNode(childNode, (childNode2: Node) => {
                    return childNode2 instanceof Element && childNode2.tagName === 'ScaleDenominator';
                });
                if(scaleNode === null) {
                    throw new UserError('Could not find tilematrix scale');
                }
                let scaleRatio = parseFloat(scaleNode.textContent) / scale;
                if(scaleRatio < 1) {
                    scaleRatio = 1 / scaleRatio;
                }
                if(closestScaleRatio === null || scaleRatio < closestScaleRatio) {
                    const identifierNode = findChildNode(childNode, (childNode2: Node) => {
                        return childNode2 instanceof Element && childNode2.tagName === 'ows:Identifier';
                    });
                    if(identifierNode === null) {
                        throw new UserError('Could not find tilematrix identifier');
                    }

                    closestScaleRatio = scaleRatio;
                    closestTileMatrix = identifierNode.textContent;
                }
            }
        });
        if(closestTileMatrix === null) {
            throw new UserError('Could not find tilematrix');
        }

        return closestTileMatrix;
    }

    getTileMatrix(tileMatrixIdentifier: string): TileMatrix {
        const tileMatrixSetNode = this.getTileMatrixSetNode();

        let tileMatrix: TileMatrix = null;
        tileMatrixSetNode.childNodes.forEach((childNode) => {
            if(tileMatrix === null && childNode instanceof Element && childNode.tagName === 'TileMatrix') {
                const identifierNode = findChildNode(childNode, (childNode2: Node) => {
                    return childNode2 instanceof Element && childNode2.tagName === 'ows:Identifier';
                });
                if(identifierNode === null) {
                    throw new UserError('Could not find tilematrix identifier');
                }

                if(identifierNode.textContent === tileMatrixIdentifier) {
                    tileMatrix = {
                        identifier: null,
                        scaleDenominator: null,
                        topLeftCorner: null,
                        tileWidth: null,
                        tileHeight: null,
                        matrixWidth: null,
                        matrixHeight: null,
                    };

                    childNode.childNodes.forEach((childNode2) => {
                        if(!(childNode2 instanceof Element)) {
                            return;
                        }

                        switch(childNode2.tagName) {
                            case 'ows:Identifier': tileMatrix.identifier = childNode2.textContent; break;
                            case 'ScaleDenominator': tileMatrix.scaleDenominator = parseFloat(childNode2.textContent); break;
                            case 'TopLeftCorner':
                                const parts = childNode2.textContent.split(' ');
                                tileMatrix.topLeftCorner = [parseFloat(parts[0]), parseFloat(parts[1])];
                                break;
                            case 'TileWidth': tileMatrix.tileWidth = parseInt(childNode2.textContent); break;
                            case 'TileHeight': tileMatrix.tileHeight = parseInt(childNode2.textContent); break;
                            case 'MatrixWidth': tileMatrix.matrixWidth = parseInt(childNode2.textContent); break;
                            case 'MatrixHeight': tileMatrix.matrixHeight = parseInt(childNode2.textContent); break;
                        }
                    });

                    if(
                        tileMatrix.identifier === null
                        || tileMatrix.scaleDenominator === null
                        || tileMatrix.topLeftCorner === null
                        || tileMatrix.tileWidth === null
                        || tileMatrix.tileHeight === null
                        || tileMatrix.matrixWidth === null
                        || tileMatrix.matrixHeight === null
                    ) {
                        throw new UserError('Could not find complete tilematrix data');
                    }
                }
            }
        });
        if(tileMatrix === null) {
            throw new UserError('Could not find tile matrix');
        }

        return tileMatrix;
    }

    downloadLegend() {
        alert('Could not find legend URL');
    }
}
