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

export default class Wms {
    private params: WmsParams;

    constructor(readonly url: string, params: WmsParams = {}) {
        this.params = Object.assign({
            version: '1.3.0',
            service: 'WMS',
        }, params);
    }

    buildUrl(params: WmsParams) {
        params = Object.assign({}, this.params, params);

        return this.url + '?' + $.param(params);
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            request: 'GetMap',
            CRS: 'EPSG:25832',
            styles: 'default',
            format: 'image/png',
        }, params);

        return this.buildUrl(params);
    }
}

export class WmsKadaster25 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top25raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top25raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsKadaster50 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top50raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top50raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsKadaster100 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top100raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top100raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsKadaster250 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top250raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top250raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsKadaster500 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top500raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top500raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsKadaster1000 extends Wms {
    constructor() {
        super('https://geodata.nationaalgeoregister.nl/top1000raster/wms');
    }

    mapUrl(params: WmsParams) {
        params = Object.assign({}, {
            CRS: 'EPSG:28992',
            width: '2000',
            height: '2000',
            layers: 'top1000raster',
        }, params);

        return super.mapUrl(params);
    }
}

export class WmsGermanyRP extends Wms {
    constructor() {
        super('https://geo4.service24.rlp.de/wms/rp_dtk25.fcgi');
    }

    mapUrl(params: WmsParams) {
        // Wanted to use EPSG:4258 (ETRS89) here as that is used in the original maps in germany. However,
        // the WMS data is returned in a rectangular grid while the original maps obey the distortion introduced
        // by the ETRS89 system; making the map 1mm smaller in both the top left and top right corner when compared to
        // the bottom left and bottom right corner. The WMS point seems to return exactly the same area, but in a
        // rectangular fashion instead of the trapezium(-ish?) shape we desire. This may distort our maps, so we do
        // not (yet) do down that path.

        // Instead, we choose to use UTM as our base, making the maps more like the dutch maps; rectangular maps
        // containing a grid parallel to the map.
        params = Object.assign({}, {
            CRS: 'EPSG:25832',
            width: '2000',
            height: '2000',
            layers: 'rp_dtk25',
        }, params);

        return super.mapUrl(params);
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
