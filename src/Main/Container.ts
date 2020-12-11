import Wms from "../Util/Wms";

export default class Container {
    private static WMSes: Record<string, Wms> = {};

    static registerWms(wms: Wms) {
        Container.WMSes[wms.name] = wms;
    }

    static wms(name: string): Wms {
        if(!Container.WMSes.hasOwnProperty(name)) {
            throw new Error('Unknown WMS "' + name + '"');
        }

        return Container.WMSes[name];
    }

    static wmsList(): Wms[] {
        return Object.values(this.WMSes);
    }
}
