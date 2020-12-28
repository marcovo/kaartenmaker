import Cache from "../Util/Cache";
import CutoutTemplate from "./CutoutTemplate";
import MapImageProvider from "../Projection/MapImageProvider";
import Wms from "../Projection/Wms";
import Wmts from "../Projection/Wmts";
import Paper from "../Util/Paper";
import {Serialization} from "./Serializer";

export default class Container {
    static readonly CUSTOM_CUTOUT_TEMPLATE_LOCALSTORAGE_KEY = 'custom_cutout_templates';

    private static mapImageProviders: Record<string, MapImageProvider> = {};

    private static paperFormats: Record<string, Paper> = {};

    private static systemCutoutTemplates: CutoutTemplate<any, any, any>[] = [];
    private static customCutoutTemplates: CutoutTemplate<any, any, any>[] = [];

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

    static registerPaper(paper: Paper): void {
        Container.paperFormats[paper.name] = paper;
    }

    static getPaper(name: string): Paper {
        if(!Container.paperFormats.hasOwnProperty(name)) {
            throw new Error('Unknown paper "' + name + '"');
        }

        return Container.paperFormats[name];
    }

    static getPaperList(): Paper[] {
        return Object.values(this.paperFormats);
    }

    static registerSystemCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        Container.systemCutoutTemplates.push(cutoutTemplate);
    }

    static registerCustomCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        Container.customCutoutTemplates.push(cutoutTemplate);
    }

    static getSerializedCustomCutoutTemplatesFromStorage(): Record<string, Serialization> {
        const entry = window.localStorage.getItem(Container.CUSTOM_CUTOUT_TEMPLATE_LOCALSTORAGE_KEY);
        if(entry === null) {
            return {};
        }
        return <Record<string, Serialization>>JSON.parse(entry);
    }

    static registerCustomCutoutTemplates(): void {
        const serializedTemplates = Container.getSerializedCustomCutoutTemplatesFromStorage();
        for(const name in serializedTemplates) {
            const serialized = serializedTemplates[name];
            const cutoutTemplate = CutoutTemplate.unserialize(serialized);
            Container.registerCustomCutoutTemplate(cutoutTemplate);
        }
    }

    static addCustomCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        Container.customCutoutTemplates.push(cutoutTemplate);

        const serializedTemplates = Container.getSerializedCustomCutoutTemplatesFromStorage();
        serializedTemplates[cutoutTemplate.name] = cutoutTemplate.serialize();
        window.localStorage.setItem(Container.CUSTOM_CUTOUT_TEMPLATE_LOCALSTORAGE_KEY, JSON.stringify(serializedTemplates));
    }

    static removeCustomCutoutTemplate(cutoutTemplate: CutoutTemplate<any, any, any>) {
        const index = Container.customCutoutTemplates.indexOf(cutoutTemplate);
        if(index > -1) {
            Container.customCutoutTemplates.splice(index, 1);
        }

        const serializedTemplates = Container.getSerializedCustomCutoutTemplatesFromStorage();
        delete serializedTemplates[cutoutTemplate.name];
        window.localStorage.setItem(Container.CUSTOM_CUTOUT_TEMPLATE_LOCALSTORAGE_KEY, JSON.stringify(serializedTemplates));
    }

    static cutoutTemplateList(): CutoutTemplate<any, any, any>[] {
        return [...Container.systemCutoutTemplates, ...Container.customCutoutTemplates];
    }

    static systemCutoutTemplateList(): CutoutTemplate<any, any, any>[] {
        return Container.systemCutoutTemplates;
    }

    static customCutoutTemplateList(): CutoutTemplate<any, any, any>[] {
        return Container.customCutoutTemplates;
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

    static clearCaches(): Promise<void> {
        return new Promise(((resolve, reject) => {
            if(this.cache !== null) {
                this.cache.close();
                this.cache = null;
            }

            Cache.drop().then(() => {
                window.localStorage.clear();
                resolve();
            }, reject);
        })).then(() => {
            alert('De buffers zijn geleegd');
        }).catch((...args) => {
            console.log(...args);
            alert('Something went wrong clearing the cache');
        });
    }
}
