import CoordinateSystem from "../Coordinates/CoordinateSystem";
import CoordinateConverter from "../Util/CoordinateConverter";
import Coordinate from "../Coordinates/Coordinate";
import Container from "../Main/Container";
import MapImageProvider from "./MapImageProvider";
import {GridSpec} from "../Main/Grid";
import UserError from "../Util/UserError";

const $ = require( 'jquery' );

export type WmsParams = {
    version?: string,
    service?: string,
    request?: string,
    CRS?: string,
    styles?: string,
    layers?: string,
    format?: string,
    bbox?: string,
    width?: string,
    height?: string,
};

export type ScaleRange = { min: number|null, max: number|null };

export default class Wms implements MapImageProvider {

    private capabilities : Document = null;

    readonly params: WmsParams;

    private mipDrawnGrid: GridSpec = null;

    constructor(
        readonly name: string,
        readonly title: string,
        readonly url: string,
        readonly copyright: string,
        private defaultGridCoordinateSystem: CoordinateSystem<Coordinate>,
        private defaultScale: number,
        params: WmsParams = {}
    ) {
        this.params = Object.assign({
            version: '1.3.0',
            service: 'WMS',
        }, params);
    }

    includesDrawnGrid(base_x: number, delta_x: number, base_y: number, delta_y: number) {
        this.mipDrawnGrid = {base_x, delta_x, base_y, delta_y};
        return this;
    }

    getDrawnGrid(): GridSpec {
        return this.mipDrawnGrid;
    }

    getCopyright(): string {
        return this.copyright;
    }

    getCoordinateSystem(): CoordinateSystem<any> {
        if(!this.params.hasOwnProperty('CRS') || this.params['CRS'].length === 0) {
            throw new Error('No default coordinate system set');
        }
        return CoordinateConverter.getCoordinateSystem(this.params['CRS']);
    }

    getDefaultGridCoordinateSystem(): CoordinateSystem<Coordinate> {
        return this.defaultGridCoordinateSystem;
    }

    getDefaultScale(): number {
        return this.defaultScale;
    }

    buildUrl(params: WmsParams) {
        params = Object.assign({}, this.params, params);

        return this.url + '?' + $.param(params);
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            request: 'GetMap',
            styles: 'default',
            format: 'image/png',
            width: '2000',
            height: '2000',
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

    getSuggestedScaleRange(): Promise<ScaleRange> {
        return this.fetchCapabilities().then((xmlDoc) => {

            let nsResolver = null;
            const xmlns = xmlDoc.documentElement.getAttribute('xmlns');
            if(xmlns !== null) {
                nsResolver = function(prefix) {
                    if(prefix === 'xx') {
                        return xmlns;
                    }
                }
            }

            const min = xmlDoc.evaluate('//xx:MinScaleDenominator', xmlDoc, nsResolver, XPathResult.STRING_TYPE).stringValue;
            const max = xmlDoc.evaluate('//xx:MaxScaleDenominator', xmlDoc, nsResolver, XPathResult.STRING_TYPE).stringValue;

            return <ScaleRange> {
                min: min.length === 0 ? null : parseFloat(min),
                max: max.length === 0 ? null : parseFloat(max),
            };
        });
    }

    downloadLegend() {
        const xmlDoc = this.getCapabilitiesOrThrow();

        let nsResolver = null;
        const xmlns = xmlDoc.documentElement.getAttribute('xmlns');
        if(xmlns !== null) {
            nsResolver = function(prefix) {
                if(prefix === 'xx') {
                    return xmlns;
                }
            }
        }

        const node = xmlDoc.evaluate('//xx:LegendURL/xx:OnlineResource', xmlDoc, nsResolver, XPathResult.ANY_TYPE).iterateNext();
        if(node) {
            // @ts-ignore
            const url = node.attributes['xlink:href'].value;

            window.open(url);
        } else {
            alert('Could not find legend URL');
        }
    }
}



/*
const { jsPDF } = window.jspdf;
Wms.pdf = function() {
    $.get(Wms.doGetMapUrl(), function(data) {console.log(data);
        var img = document.createElement('img');
        //img.src = 'data:image/png;base64,' + Base64.encodeURI(data);
        //img.src = URL.createObjectURL(new Blob(data, {type : 'image/png'}));
        //$('.cutoutList')[0].appendChild(img);

        //var fr = new FileReader();
        //fr.onload = function(e) {console.log(fr.result);
        //	img.src = fr.result; //Display saved icon
        //	$('.cutoutList')[0].appendChild(img);
        //};
        //fr.readAsDataURL(new Blob([data], {type : 'image/png'}));

        var xhr = new XMLHttpRequest();
        xhr.open('GET', Wms.doGetMapUrl(), true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            var icon_blob = xhr.response; //That can be saved to db


            var fr = new FileReader();
            fr.onload = function(e) {
                img.src = fr.result; //Display saved icon
                $('.cutoutList')[0].appendChild(img);
            };
            fr.readAsDataURL(icon_blob);
        };
        xhr.send(null);

    }, 'text')

    //var img = new Image();
    //img.src = Wms.doGetMapUrl();
    //img.onload = function () {
    //	const doc = new jsPDF();
    //	doc.addImage(img, 'PNG', 10, 20, 50, 50);
    //	doc.save("a4.pdf");
    //};

    //const doc = new jsPDF();
    //doc.addImage(Wms.doGetMapUrl(), 'PNG', 10, 20, 50, 50);
    //doc.save("a4.pdf");
}
*/
