import Cutout from "./Cutout";
import UserInterface from "./UserInterface";
import {stringToUnit8array, uint8arrayToString} from "../Util/functions";
const pako = require('pako');

export type Serialization = Record<string, any>;

export default class Serializer {

    private getBaseLink(): string {
        return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    }

    createCutoutLink(cutout: Cutout<any, any, any>) : string {
        return this.createLink([cutout], cutout.userInterface);
    }

    createWorkspaceLink(userInterface: UserInterface): string {
        return this.createLink(userInterface.getCutouts(), userInterface);
    }

    private createLink(cutouts: Cutout<any, any, any>[], userInterface: UserInterface): string {
        const exportString = this.export(cutouts, userInterface);

        const deflatedString = uint8arrayToString(pako.deflate(exportString));

        return this.getBaseLink() + '?workspace=' + encodeURIComponent(btoa(deflatedString));
    }

    importFromLink(linkData: string, userInterface: UserInterface): Promise<void> {
        const deflatedString = atob(linkData);

        const inflatedString = uint8arrayToString(pako.inflate(stringToUnit8array(deflatedString)));

        return this.import(inflatedString, userInterface);
    }

    serializeWorkspace(userInterface: UserInterface): Serialization {
        return this.serialize(userInterface.getCutouts(), userInterface);
    }

    private export(cutouts: Cutout<any, any, any>[], userInterface: UserInterface): string {
        return JSON.stringify(this.serialize(cutouts, userInterface));
    }

    private import(serializedString: string, userInterface: UserInterface): Promise<void> {
        return this.unserialize(JSON.parse(serializedString), userInterface);
    }

    private serialize(cutouts: Cutout<any, any, any>[], userInterface: UserInterface): Serialization {
        const serialized = {
            cutouts: [],
        };

        for(const cutout of cutouts) {
            serialized.cutouts.push(cutout.serialize());
        }

        return serialized;
    }

    unserialize(serialized: Serialization, userInterface: UserInterface): Promise<void> {
        const promises: Promise<void>[] = [];
        const cutouts: Cutout<any, any, any>[] = [];
        if(serialized.cutouts !== undefined) {
            for(const cutoutSerialized of serialized.cutouts) {
                const promise = Cutout.unserialize(cutoutSerialized, userInterface)
                    .then((cutout) => {
                        cutouts.push(cutout);
                    })
                ;

                promises.push(promise);
            }
        }

        return Promise.all(promises).then(() => {
            userInterface.setFromUnserialize(cutouts);
        });
    }


}
