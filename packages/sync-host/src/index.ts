import {History} from 'history';
import iFrameResize from 'iframe-resizer/js/iframeResizer';
import {eventType} from '@ringcentral/web-apps-common';
import {Sync, addHash, removeHash, SyncInit} from '@ringcentral/web-apps-sync';

export enum trackingMode {
    hash = 'hash',
    disabled = 'disabled',
    slave = 'slave',
    full = 'full',
}

export interface HostSyncInit extends Pick<SyncInit['postMessage'], 'origin'> {
    id: string;
    url: string;
    iframe: HTMLIFrameElement;
    history: History;
    tracking?: trackingMode;
    minHeight?: any;
}

export class HostSync extends Sync {
    public history: History = null;
    public iframe: HTMLIFrameElement = null;
    public tracking: trackingMode = null;

    public constructor({
        id,
        url,
        iframe,
        history,
        tracking = trackingMode.hash,
        minHeight = 500, // needed to accomodate login
        origin = undefined,
    }) {
        super({
            id,
            events: {
                target: iframe,
                types: [eventType.popup, eventType.message],
            },
            postMessage: {
                receiver: iframe.contentWindow,
                target: window,
                handler: (...args) => this.handlePostMessage(...args),
                types: [eventType.popup, eventType.message, eventType.authError],
                origin,
            },
            history,
        });

        this.tracking = tracking;

        this.iframe = iframe;

        try {
            const {origin, pathname, search} = new URL(url);
            const updatedPathname = pathname === '/' ? '' : pathname;
            this.iframe.src = `${origin}${updatedPathname}${this.getState()}${search}`;
        } catch (error) {
            this.iframe.src = url + this.getState();
            console.error('Invalid URL of iframe', url);
        }

        !this.iframe['iFrameResizer'] &&
            iFrameResize(
                {
                    checkOrigin: false,
                    minHeight,
                    heightCalculationMethod: 'min',
                    sizeWidth: true,
                    tolerance: 50,
                },
                this.iframe,
            );
    }

    public destroy = () => {
        super.destroy();
        this.iframe = null;
        // setTimeout(() => {
        //     // we have to do it like this bc React will remove it and resizer too
        //     this.iframe['iFrameResizer'].close(); // this actually does nothing besides removing from DOM
        // }, 1);
    };

    protected handlePostMessage = ({type, data}) => {
        if (type === eventType.location) {
            this.open(data);
            return true;
        }
    };

    protected getState = () => {
        switch (this.tracking) {
            case trackingMode.hash:
                return removeHash(new URL(super.getState(), location.origin).hash);
            case trackingMode.disabled:
                return '';
            case trackingMode.full:
            case trackingMode.slave:
                return super.getState();
            default:
                throw new Error(`Unknown tracking mode ${this.tracking}`);
        }
    };

    protected setState = state => {
        switch (this.tracking) {
            case trackingMode.hash:
                const url = new URL(super.getState(), location.origin);
                url.hash = addHash(state);
                return super.setState(url.toString().replace(location.origin, ''));
            case trackingMode.disabled:
            case trackingMode.slave:
                return; // ignore state change
            case trackingMode.full:
                return super.setState(state);
            default:
                throw new Error(`Unknown tracking mode ${this.tracking}`);
        }
    };

    protected open = location => super.setState(location);
}
