import Cache from "../Util/Cache";
import CutoutTemplate from "./CutoutTemplate";
import MapImageProvider from "../Util/MapImageProvider";
import Wms from "../Util/Wms";
import Wmts from "../Util/Wmts";

export default class Container {
    private static mapImageProviders: Record<string, MapImageProvider> = {};

    private static cutoutTemplates: CutoutTemplate<any, any, any>[] = [];

    private static cache: Cache = null;

    static registerMapImageProvider(mapImageProvider: MapImageProvider) {
        Container.mapImageProviders[mapImageProvider.name] = mapImageProvider;
    }

    static mapImageProvider(name: string): MapImageProvider {
        if(!Container.mapImageProviders.hasOwnProperty(name)) {
            throw new Error('Unknown map image provider "' + name + '"');
        }

        return Container.mapImageProviders[name];
    }

    static wms(wmsName: string): Wms {
        const wms = Container.mapImageProvider(wmsName);
        if(!(wms instanceof Wms)) {
            throw new Error('Map image provider "' + name + '" is not WMS');
        }
        return wms;
    }

    static wmts(wmtsName: string): Wmts {
        const wms = Container.mapImageProvider(wmtsName);
        if(!(wms instanceof Wmts)) {
            throw new Error('Map image provider "' + name + '" is not WMTS');
        }
        return wms;
    }

    static mapImageProviderList(): MapImageProvider[] {
        return Object.values(Container.mapImageProviders);
    }

    static registerCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        Container.cutoutTemplates.push(cutoutTemplate);
    }

    static cutoutTemplateList(): CutoutTemplate<any, any, any>[] {
        return Container.cutoutTemplates;
    }

    static getCache(): Promise<Cache> {
        return new Promise((resolve, reject) => {
            if(this.cache !== null) {
                resolve(this.cache);
            } else {
                const cache = new Cache();
                cache.initialize().then(() => {
                    this.cache = cache;
                    resolve(cache);
                });
            }
        });
    }
}
