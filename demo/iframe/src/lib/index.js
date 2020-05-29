import {IFrameSync} from '@ringcentral/web-apps-sync-iframe';
import {eventType, dispatchEvent} from '@ringcentral/web-apps-react';
import SDK from '@ringcentral/sdk';

const apiEntryPointKey = 'apiEntryPoint';

export const sync = new IFrameSync({
    history: 'html5',
    id: 'iframe', // must match host config
    origin: `http://localhost:${process.env.REACT_APP_HOST_PORT}`, // strict mode, remove if you don't know the host
});

// this will remove the apiEntryPoint from URL
if (window.location.search.includes(apiEntryPointKey)) {
    const search = new URLSearchParams(window.location.search);
    localStorage.apiEntryPoint = search.get(apiEntryPointKey); // this will preserve entry point between HMR
    search.delete(apiEntryPointKey);
    const newUrl = new URL(window.location);
    newUrl.search = search;
    window.history.replaceState(null, null, newUrl.toString());
}

if (!localStorage.apiEntryPoint) throw new Error('No API entry point was provided!');

const apiEntryPoint = decodeURIComponent(localStorage.apiEntryPoint); // we don't need to use ENV here as everything is provided by host

const {pathname, protocol, host} = new URL(apiEntryPoint);

export const sdk = new SDK({
    server: `${protocol}//${host}`,
    urlPrefix: pathname,
    authProxy: true,
});

sdk.client().on(sdk.client().events.requestError, error => {
    const {response} = error;
    if (!response || response.status === 401)
        dispatchEvent(sync.getEventTarget(), eventType.authError, response ? response.statusText : error.toString());
});
