import {eventType} from '@ringcentral/web-apps-common';
import {Sync, historyType, SyncInit} from '@ringcentral/web-apps-sync';

export {historyType};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IFrameSyncInit extends Pick<SyncInit['postMessage'], 'origin'>, Pick<SyncInit, 'base'> {
    id?: string;
    history?: historyType;
    sendInitialLocation?: boolean;
}

export class IFrameSync extends Sync {
    public constructor({
        id,
        history = null,
        sendInitialLocation = false,
        origin = undefined,
        base = '',
    }: IFrameSyncInit = {}) {
        super({
            id,
            events: {
                target: document.createElement('iframe'),
                types: [eventType.popup, eventType.message, eventType.location, eventType.authError],
            },
            postMessage: {
                receiver: window.parent,
                target: window,
                types: [eventType.popup, eventType.message],
                origin,
            },
            history,
            base,
        });

        if (sendInitialLocation) this.historyListener();
    }
}
