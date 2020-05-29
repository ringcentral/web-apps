import {addHash, removeHash} from './hash';

export enum historyType {
    html5 = 'html5',
    hash = 'hash',
    stub = 'stub',
}

export class HistoryListener {
    protected listener = null;

    public constructor(listener) {
        this.listener = listener;
    }

    protected actualListener = () => this.listener(this.getState());

    public destroy() {}

    public setState(state: string) {}

    public getState(): string {
        return '/';
    }
}

class HTML5HistoryListener extends HistoryListener {
    protected originalPushState = null;
    protected originalReplaceState = null;

    public constructor(listener) {
        super(listener);

        window.addEventListener('popstate', this.actualListener);

        this.originalPushState = history.pushState;
        this.originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            this.originalPushState.call(history, ...args);
            this.actualListener();
        };

        history.replaceState = (...args) => {
            this.originalReplaceState.call(history, ...args);
            this.actualListener();
        };
    }

    public destroy() {
        window.removeEventListener('popstate', this.actualListener);
        history.pushState = this.originalPushState;
        history.replaceState = this.originalReplaceState;
    }

    public setState(state: string) {
        history.replaceState(null, null, state);
    }

    public getState() {
        return location.toString().replace(location.origin, '');
    }
}

class HashHistoryListener extends HistoryListener {
    public constructor(listener) {
        super(listener);
        window.addEventListener('hashchange', this.actualListener);
    }

    public destroy() {
        window.removeEventListener('hashchange', this.actualListener);
    }

    public setState(state: string) {
        window.location.hash = addHash(state);
    }

    public getState() {
        return removeHash(window.location.hash);
    }
}

class CustomHistory extends HistoryListener {
    protected detachHistoryListener = null;
    protected history = null;

    public constructor(listener, history) {
        super(listener);
        this.history = history;
        this.detachHistoryListener = history.listen(this.actualListener);
    }

    public destroy() {
        this.detachHistoryListener();
        this.history = null;
    }

    public setState(state: string) {
        this.history.replace(state); //TODO Support push(url, state)
    }

    public getState() {
        const {pathname, search, hash} = this.history.location;
        return pathname + (search || '') + (hash || '');
    }
}

export const createHistoryListener = ({listener, history = null}: {listener: any; history: historyType | any}) => {
    if (history === historyType.hash) return new HashHistoryListener(listener);
    else if (history === historyType.html5) return new HTML5HistoryListener(listener);
    else if (history === historyType.stub) return new HistoryListener(listener);
    else if (!!history) return new CustomHistory(listener, history);
    throw new Error('Cannot initialize history listener');
};
