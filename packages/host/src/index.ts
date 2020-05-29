import load from 'little-loader';
import {getAppCallback} from '@ringcentral/web-apps-common';

const makeKey = ({id, url, type}) => `${id}-${type}-${url}`;

const retryTimeout = 100;
const maxAttempts = 100;
const cache = {};

export interface AppInit {
    id: string;
    url: string | string[];
}

export interface CreateAppInit extends AppInit {
    type: string;
}

const loadScript = url =>
    new Promise((res, rej) => {
        load(url, {
            callback: err => {
                if (err) return rej(err);
                res();
            },
        });
    });

const loadLink = (url, attrs) =>
    new Promise((res, rej) => {
        const id = 'link-' + url;
        const oldLink = document.getElementById(id);
        if (oldLink && oldLink.parentNode) oldLink.parentNode.removeChild(oldLink);
        const link = document.createElement('link');
        link.id = id;
        Object.keys(attrs).forEach(key => {
            link[key] = attrs[key];
        });
        link.href = url;
        link.onload = res;
        link.onerror = rej;
        document.head.appendChild(link);
    });

const loadMixed = async (urls: string | string[]) => {
    if (!Array.isArray(urls) || typeof urls === 'string') {
        await loadScript(urls);
        return;
    }
    for (const url of urls) {
        if (url.includes('.css')) {
            await loadLink(url, {type: 'text/css', rel: 'stylesheet'});
        } else {
            await loadScript(url);
        }
    }
};

export abstract class App {
    public id: string;
    public url: string | string[];
    public loadedSource: any;

    public constructor({id, url}: AppInit) {
        this.id = id;
        this.url = url;
        this.loadedSource = this.load();
    }

    public async init() {
        await this.loadedSource;
    }

    public abstract async load();
}

export abstract class JSApp extends App {
    public async load() {
        return loadMixed(this.url);
    }
}

export class ScriptApp extends JSApp {
    public regex = /([A-Z])/g;

    public tag = () => {
        return `web-app-${this.id.replace(this.regex, v => '-' + v.toLowerCase())}`;
    };
}

export class GlobalApp extends JSApp {
    public async ensureRegistered() {
        return new Promise(res => {
            let attempts = 0;
            const checkRegistered = () => {
                try {
                    getAppCallback(this.id);
                    res();
                } catch (e) {
                    attempts++;
                    if (attempts > maxAttempts)
                        res(
                            new Error(
                                'App ' + this.id + ' has not called register function within reasonable timeframe',
                            ),
                        );
                    setTimeout(checkRegistered, retryTimeout);
                }
            };
            checkRegistered();
        });
    }

    public async load() {
        await super.load();
        await this.ensureRegistered();
    }
}

export class IFrameApp extends App {
    public async load() {}
}

export const createApp = async ({id, url, type}: CreateAppInit) => {
    const key = makeKey({id, url, type});

    if (!cache.hasOwnProperty(key)) {
        switch (type) {
            case 'script':
                cache[key] = new ScriptApp({id, url});
                break;
            case 'iframe':
                cache[key] = new IFrameApp({id, url});
                break;
            case 'global':
                cache[key] = new GlobalApp({id, url});
                break;
            default:
                throw new Error('Unknown app type ' + type);
        }
    }

    await cache[key].init();

    return cache[key];
};
