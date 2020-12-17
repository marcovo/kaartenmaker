import Wms from "../Util/Wms";
import CutoutTemplate from "./CutoutTemplate";

export default class Container {
    private static WMSes: Record<string, Wms> = {};

    private static cutoutTemplates: CutoutTemplate<any, any, any>[] = [];

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
        return Object.values(Container.WMSes);
    }

    static registerCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        Container.cutoutTemplates.push(cutoutTemplate);
    }

    static cutoutTemplateList(): CutoutTemplate<any, any, any>[] {
        return Container.cutoutTemplates;
    }
}
