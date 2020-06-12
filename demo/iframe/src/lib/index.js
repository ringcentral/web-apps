import {IFrameSync} from '@ringcentral/web-apps-sync-iframe';

export const sync = new IFrameSync({
    history: 'html5',
    id: 'iframe', // must match host config
    origin:
        process.env.NODE_ENV === 'production'
            ? window.location.origin
            : `http://localhost:${process.env.REACT_APP_HOST_PORT}`, // strict mode, remove if you don't know the host
    base: process.env.NODE_ENV === 'production' ? '/demo/iframe/build/' : '',
});
