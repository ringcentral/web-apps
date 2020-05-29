RingCentral Web Apps Sync Host
==============================

This library can be used to synchronize parent frame and the IFRAME:

- URL of parent frame and IFRAME
- IFRAME size will be set according to it's content
- CustomEvents on the IFRAME DOM node will be transmitted to and from the page inside IFRAME

## Usage: Host part

```js
import {HostSync} from "@ringcentral/web-apps-sync/lib/host";
import {makeEvent, eventType} from "@ringcentral/web-apps-common";
import {createBrowserHistory} from 'history';

const history = createBrowserHistory();
const iframe = document.getElementById('iframe');

const hostSync = new HostSync({
    url: 'http://path-to-iframe-page.com',
    iframe,
    history,
});

iframe.addEventListener(eventType.message, data => console.log(data));
iframe.dispatchEvent(makeEvent(eventType.message, {foo: 'bar'}));
```

Usage of `history` is optional. You can supply any history-like object with following API:

```js
const history = {
    listen: () => {}, // listen to pushState events, should return unsubscribe callback
    replace: (url, state) => window.history.replaceState(state, null, url), 
    push: (url, state) => window.history.pushState(state, null, url),
    get location() {
        return window.location;
    },
};
```
