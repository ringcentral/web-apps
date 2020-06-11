import {eventType} from '@ringcentral/web-apps-common';
import {postMessageEvent, postMessageListener, sendPostMessage} from './postMessage';
import {createHistoryListener, HistoryListener, historyType} from './historyListener';
import {isRetransmittedEvent, makeRetransmittedEvent} from './events';

export interface SyncInit {
    events: {
        target: HTMLElement;
        types: eventType[]; // which events to retransmit as post messages
    };
    postMessage: {
        receiver; // where to post message
        target; // where to listen to incoming post messages
        handler?: ({type, data}: {type: eventType; data: any}) => any;
        types: eventType[]; // which post messages to retransmit as events
        origin?: string;
    };
    id: string;
    base?: string;
    history?: historyType | any;
}

export abstract class Sync implements SyncInit {
    public id: string;
    public events: SyncInit['events'];
    public postMessage: SyncInit['postMessage'];
    public postMessageListener;
    public lastState = '';
    public base = '';
    public historyListenerObject: HistoryListener;

    public constructor({events, postMessage, history, id, base}: SyncInit) {
        if (!id) throw new Error('No ID');
        if (!events) throw new Error('No events config');
        if (!postMessage) throw new Error('No postMessage config');
        if (!postMessage.origin) console.warn('No origin in config of frame', window.location.origin);

        this.events = events;
        this.postMessage = postMessage;
        this.id = id;
        if (base) this.base = base;

        this.events.types.forEach(type => this.events.target.addEventListener(type, this.postMessageFromEvent));

        this.postMessageListener = postMessageListener({
            id,
            safeOrigin: this.postMessage.origin,
            callback: this.postMessageCallback,
        });

        //FIXME [UIA-10000] Implement props sync
        this.postMessage.target.addEventListener(postMessageEvent, this.postMessageListener);

        this.historyListenerObject = createHistoryListener({listener: this.historyListener, history});
    }

    protected destroy() {
        this.events.types.forEach(type => this.events.target.removeEventListener(type, this.postMessageFromEvent));
        this.postMessage.target.removeEventListener(postMessageEvent, this.postMessageListener);
        this.historyListenerObject.destroy();
    }

    public getEventTarget() {
        return this.events.target;
    }

    protected postMessageCallback = ({type, data}: {type: eventType; data}) => {
        data = JSON.parse(data);

        if (type === eventType.state) return this.updateStateOnPostMessage(data);

        if (~this.postMessage.types.indexOf(type)) return this.dispatchFromPostMessage(type, data);

        if (this.postMessage.handler && !this.postMessage.handler({type, data})) {
            throw new Error('Unknown postMessage type: ' + type);
        }
    };

    protected dispatchFromPostMessage = (type: eventType, data) =>
        this.events.target.dispatchEvent(makeRetransmittedEvent(type, data));

    protected postMessageFromEvent = event =>
        !isRetransmittedEvent(event) && this.sendPostMessage(event.type, event.detail);

    protected sendPostMessage = (type: eventType, data) => {
        if (!this.postMessage.receiver || this.postMessage.receiver === this.postMessage.target) return;

        sendPostMessage(
            this.postMessage.receiver,
            this.id,
            {
                type,
                data: JSON.stringify(data),
            },
            this.postMessage.origin,
        );
    };

    protected getState() {
        return this.historyListenerObject.getState().replace(this.base, '');
    }

    protected setState(state) {
        if (this.getState() === state || this.lastState === state) return; // last state check is needed to prevent reaction on own post message
        console.log('Setting state', this.base, state);
        this.lastState = state;
        this.historyListenerObject.setState(this.base + state);
    }

    protected historyListener = () => {
        const state = this.getState();
        if (this.lastState === state) return;
        this.lastState = state;
        console.log('Listener', this.id, this.base, state);
        this.sendPostMessage(eventType.state, state.replace(this.base, ''));
    };

    protected updateStateOnPostMessage = state => this.setState(state || '/');
}
