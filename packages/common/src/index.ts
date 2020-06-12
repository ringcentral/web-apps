import 'custom-event-polyfill';

// Events

export enum eventType {
    state = 'state',
    message = 'message',
    location = 'location',
    popup = 'popup',
    authError = 'authError',
}

export const makeEvent = (type: eventType | string, data?) => new CustomEvent(type, {detail: data});

// App callbacks

const appsProperty = 'RCApps';

window[appsProperty] = window[appsProperty] || {};

const getObject = () => window[appsProperty];

getObject().apps = getObject().apps || {};

export type AppCallback = (node: HTMLElement) => any;

export const registerAppCallback = (id, callback: AppCallback) => (getObject().apps[id] = callback);

export const getAppCallback = (id): AppCallback => {
    const callback = getObject().apps[id];
    if (!callback)
        throw new Error(
            "Application not found in registry, make sure you've called registerAppCallback before rendering",
        );
    return callback;
};

export const dispatchEvent = (node: HTMLElement | any, event: eventType, data: any) => {
    if (!node) console.warn('Cannot dispatch event: node has not been mounted', event, data);
    return node && node.dispatchEvent(makeEvent(event, data));
};
