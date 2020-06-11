import {IFrameSync} from '@ringcentral/web-apps-sync-iframe';

export const sync = new IFrameSync({
    history: 'html5',
    id: 'iframe', // must match host config
    origin: window.location.origin, // strict mode, remove if you don't know the host
});
