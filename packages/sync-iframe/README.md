RingCentral Web Apps Sync IFRAME
================================

This library can be used to synchronize parent frame and the IFRAME:

- URL of parent frame and IFRAME
- IFRAME size will be set according to it's content
- CustomEvents on the IFRAME DOM node will be transmitted to and from the page inside IFRAME

## Usage: IFRAME part

```js
import {IFrameSync} from "@ringcentral/web-apps-sync/lib/iframe";
import {makeEvent, eventType} from "@ringcentral/web-apps-common";

const iframeSync = new IFrameSync({
    history: 'html5', // also can be hash or custom history object
    sendInitialLocation: true // will trigger location event once created
});

iframeSync.getEventTarget().addEventListener(eventType.message, data => console.log(data));
iframeSync.getEventTarget().dispatchEvent(makeEvent(eventType.message, {foo: 'bar'}));
```

For react applications to simplify link between Sync and History follow this pattern:

```jsx
import {createBrowserHistory} from 'history';
import {Router} from 'react-router-dom';

const history = createBrowserHistory();

const iframeSync = new IFrameSync({history});

export defult <Router history={history}>...</Router>;
```