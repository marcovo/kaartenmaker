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
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    buildUrl(params: WmsParams) {
        params.version = params.version || '1.3.0';
        params.service = params.service || 'WMS';

        return this.url + '?' + $.param(params);
    }

    mapUrl(params: WmsParams) {
        params.request = params.request || 'GetMap';
        params.CRS = params.CRS || 'EPSG:25832';
        params.styles = params.styles || 'default';
        params.layers = params.layers || 'rp_dtk25';
        params.format = params.format || 'image/png';

        return this.buildUrl(params);
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
