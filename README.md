Web Apps
========

This framework provides support for embeddable apps infrastructure aka Microfrontends. Host application can delegate the actual features to other apps and provide seamless navigation and UX between those apps. Applications can be implemented using any JS framework and can be deployed anywhere, can have own release cycle. Host can be a React application or any other JS framework thanks to Web Components support.

Common pitfall of all Microfrontends is inability to efficiently and seamlessly share dependencies between host and apps. Web Apps framework is written with built-in support of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation), so apps can declare and share dependencies in a standard way.

- Location synchronization between app and host
- Ability to deep-link "app to app" or "app to host" or "host to app"
- Consistent event-based interaction between apps and host
- IFrame resize based on content of IFrame
- IFrame popup support
- Maximum adherence to Web Standards
- 3-legged auth support
- Written in TypeScript
- React and Web Component host helpers
- Unlimited nesting of apps within other apps, e.g. each app can become a host for more apps

Quick remark. This framework is most useful when you have a system where apps can be written using different frameworks and you need a layer to orchestrate it. There's no need for this framework if you only deal with React host and React apps, Module Federation will work just fine for you. However, if you have to show `iframe`-based apps, or, say, Vue or Angular app inside React app, the Web Apps framework is a way to go.

## TOC

- [App Types](#app-types)
- [How It Works](#how-it-works)
- [Host](#host)
    - [React Host](#react-host)
        - [HTML5 location sync and multiple instances of History object](#html5-location-sync-and-multiple-instances-of-history-object)
        - [React Dev Tools](#react-dev-tools)
    - [Hosts without React](#hosts-without-react)
    - [Host-IFrame sync tracking modes](#host-iframe-sync-tracking-modes)
    - [Authentication](#authentication)
    - [App Registry (optional)](#apps-registry-optional)
- [Apps](#apps)
    - [Web Component Apps](#web-component-apps)
        - [React-based Web Component Apps](#react-based-web-component-apps)
    - [Global Apps](#global-apps)
        - [Webpack Module Federation Apps](#webpack-module-federation-apps)
        - [React-based Webpack Module Federation Apps](#react-based-webpack-module-federation-apps)
        - [Global Apps JSONP](#global-apps)
        - [React-based Global Apps JSONP](#react-based-global-apps)
        - [Global Apps in Direct mode](#global-apps-in-direct-mode)
    - [IFrame Apps](#iframe-apps)
        - [React-based IFrame Apps](#react-based-iframe-apps)
- [Demo](#demo)
- [Upgrading](#upgrading)

## App Types

There are 3 kind of embeddable applications: IFrame and Web Component based.

An IFrame application (type `iframe`) is rendered inside the `iframe` and can synchronize it's URL and size with the main application.

`Web Component` based application (type `script`) is represented by a Custom Element (`HTMLElement`), a native technology available in modern browsers (for less modern browsers like Safari or IE11 we have a polyfill).

Global application (type `global`) is just a `div` which acts as a mount point for an app. App lives in global JS and CSS scopes.

Library loads scripts and styles for the App, manages the lifecycle of Custom Elements, Global Apps and IFrames and allows to interact with the host using consistent event-based system with same interface no matter what kind of app it is.

### How To Choose An App Type

You can use the following table when choosing which app type better suits for your case:

|  | IFrame | Web Components | Global |
|-|-|-|-|
| Type in config | `iframe` | `script` | `global` |
| Isolation | Full: CSS, scripts | :warning: Partial: CSS when not polyfilled | :warning: No isolation |
| Hot Module Replacement | Full support | :warning: Requires custom tailoring | :warning: Requires custom tailoring |
| Popups | :warning: Limited to size of `iframe`, popup body must scroll | No limitations | No limitations |
| Navigation | No limitations, `iframe` path will be synced as hosts's `hash` | No limitations | No limitations |
| 3rd Party | Only choice | :warning: Forbidden to use for 3rd Parties | :warning: Forbidden to use for 3rd Parties |

Framework provides ability to load apps developed by 3rd parties, which has to be used with caution. Best isolation is provided by `iframe` mode.

## How It Works

The concept of this package is to load an application with certain type & URLs, render it on the page in any place and wire events between Host and App.

Events with like `eventTypes.message` from `@ringcentral/web-apps-*` packages will be transmitted to any type of app including IFrame.

Here are the simplified flows of events:

```
Host App <-> IFrame Node <-> postMessage <-> Synthetic IFrame Node <-> IFrame App
Host App <-> Custom Element Node <-> Web Component App
Host App <-> Div Element <-> Global App
```

### Events

Events are instances of `CustomEvent` class and have `detail` property that carries the event value. Type of value depends on type of event.

- `message` — anything
- `popup` — special event that carries requested backdrop color as value
- `authError` — special event to notify Host that App has authentication error, host should display login page in this case
- `location` — special event that tells Host to open certain location, *handled automatically, no need to capture*
- `state` — special event to sync location between Host and IFrame, *handled automatically, no need to capture*

### IFrame retransmission flow from `iframe` to host

1. IFrame app emits `CustomEvent` on synthetic `iframe` node
2. IFrame SDK listens to event and retransmits it over `postMessage` to Host
3. Host SDK receives `postMessage` and emits `RetransmittedEvent` on the real `iframe` node
4. Host listens to `RetransmittedEvent` on the real `iframe` node

## Polyfills

Host must include following polyfills:

```bash
npm install @webcomponents/webcomponentsjs @babel/polyfill --save-dev
```

```js
import "@babel/polyfill";
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter";
import "@webcomponents/webcomponentsjs";
```

We have to use either https://github.com/github/babel-plugin-transform-custom-element-classes on app-level or  
`@webcomponents/webcomponentsjs/custom-elements-es5-adapter` on host-level because app-level Babel-transpiled ES5
classes can't properly inherit browser's native ES6 classes.

There's no need to add polyfills to Web Component apps, IFrame apps has to manage their polyfills individually. Web Components polyfills are not needed if you are not using WC-based apps.

## Host

Let's review few things before we get started with configuring the host.

### Host popup backdrop for IFrame apps

If you plan to display IFrame applications Host must import (or declare by itself) some CSS in order to display popup backdrop.

Install the package:

```bash
$ npm install @ringcentral/web-apps-host-css
```

Then import it:

```js
import '@ringcentral/web-apps-host-css/styles.css';
```

This assumes your Host will have this code around App that can be IFrame:

```jsx
<div className={popup && 'app-popup'}>
<div
    className="app-popup-bg"
    role="presentation"
    style={{backgroundColor: popup}}
/>
```

Popup variable has a color that was received in special popup event that we can capture on host. Color is needed to show properly colored backdrop because different IFrame apps may have different shade of backdrop. Empty variable means no popup.

### React host

Install the `@ringcentral/web-apps-host-react` package by running following command:

```bash
$ npm install @ringcentral/web-apps-host-react
```

#### Hooks

In order to display an app on the host we will use the `useApplication` hook, it will load the source from the URL and provide a `Component` that you can insert in your Host application.

```js
import {useApplication, eventType, useListenerEffect, dispatchEvent} from '@ringcentral/web-apps-host-react';

const Page = () => {
    const {error, Component, node, loading} = useApplication({
        id: 'xxx', // should be unique for each app
        
        type: 'script', // or global or iframe
        
        url: 'http://example.com/script.js', // one URL that will load all
        
        // or multiple URLs as an array, order matter
        //url: [ 
        //    'http://example.com/styles.css',
        //    'http://example.com/bundle.js',
        //    'http://example.com/entry.js'
        //]        
    });
    
    // Messages
    const [messages, setMessages] = useState([]);
    const onMessage = event => setMessages(messages => [...messages, event.detail]);
    useListenerEffect(node, eventType.message, onMessage);
    
    // Popups
    const [popup, setPopup] = useState(false);
    const onPopup = event => setPopup(popup => (popup !== event.detail ? event.detail : popup));
    useListenerEffect(node, eventType.popup, onPopup);

    if (error) return <div>App cannot be rendered: {error.toString()}</div>;
    
    return <div className={popup && 'app-popup'}>
        <div
            className="app-popup-bg"
            onClick={e => dispatchEvent(node, eventType.popup, false)}
            style={{backgroundColor: popup}}
            role="presentation"
        />

        {loading && <div>App is mounting</div>}
        {/* Component must be placed unconditionally, do not do !loading && Component */}
        <Component/>

        <div>{JSON.stringify(messages)}</div>
        <div><button onClick={e => dispatchEvent(node, eventType.message, {foo: 'bar'})}>Send Message</button></div>
    </>;
};
```

When `Component` is rendered a DOM `node` (either a Web Component's `HTMLElement` or an `iframe` or a `div`) is created & mounted. All props provided to `Component` will be spread on this DOM `node`.

This DOM `node` is used for communication with the App:

```js
useListenerEffect(node, eventType.message, event => console.log(event.detail));
dispatchEvent(node, eventType.message, {foo: 'bar'})
```

#### Render prop

```js
import {Application} from '@ringcentral/web-apps-host-react';

const Page = () => (
    <Application id="id" url="http://example.com/script.js" type="script">{
        ({error, loading, Component, node}) => {/* same stuff from hooks example */}}
    </Application>
);
``` 

#### HOC

```js
import {withApplication} from '@ringcentral/web-apps-host-react';

// you can pre-bind the app config
const OneAppComponent = withApplication({id: 'id', url: 'http://example.com/script.js', type: 'script'})(
    ({error, loading, Component, node}) => (
        /* same stuff from hooks example */
        Component
    )
);

// then you can place it anywhere 
const Page1 = () => <OneAppComponent />;

// or app config should be provided as props
const MultipleAppComponent = withApplication()(
    ({error, loading, Component, node}) => (
        /* same stuff from hooks example */
        Component
    )
);

// and then
const Page2 = () => <MultipleAppComponent id="id" url="http://example.com/script.js" type="script" />; 
```

#### HTML5 location sync and multiple instances of History object

If you're using hash location you may skip this part.

Since `history` library and `react-router` do not support listening to global `window.history` object due to lack of `push` and `replace` events on the latter we need to use custom `LocationSync`.

We suggest putting it in the Router config at the very top of the application:

```js
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {LocationSync} from '@ringcentral/web-apps-host-react';

export default () => (
    <BrowserRouter>
        <LocationSync />
        {/* normal route config as usual */}
    </BrowserRouter>
);
```

This is a bulletproof solution because no matter what causes `window.history.push(...)` it will be captured and Host router will be synchronized. We suggest to use this solution when you don't control what is happening in apps and what framework they use, for example they are third party. **Unfortunately this has a drawback, when host will change location history block (`Prompt` component of `react-router`) on app level won't kick in.**

However if you DO control apps and all of them are either React or IFrame, you can do the small trick to enable `Prompt`, `LocationSync` won't be needed since there's only one `history` object:

```js
import React from 'react';
import {createBrowserHistory} from 'history';
import {Router} from 'react-router-dom';

// This allows to block history in sub-apps, this is not required in general
window.RCAppsDemoHistory = createBrowserHistory();

export default () => (
    <Router history={window.RCAppsDemoHistory}>
        {/* normal route config as usual */}
    </Router>
);
```

And then in React-based Apps routers as well:

```js
export default () => (
    <Router history={window.RCAppsDemoHistory}>
        {/* normal route config as usual */}
    </Router>
);
```

Then `Prompt` will work as usual:

```js
import React from 'react';
import {Prompt} from 'react-router-dom';

export default () => (
    <div>
        <Prompt when={true} message={location => `Are you sure you want to go to ${location.pathname}`} />
        Whatever
    </div>
);
```

#### React Dev Tools

Different guest application types are requiring different sets of actions to make devtools work.

##### IFrame

You can use [react-devtools-inline](https://github.com/facebook/react/tree/master/packages/react-devtools-inline) if your host application is **not** built with React.

You can use standalone [react-devtools](https://github.com/facebook/react/tree/master/packages/react-devtools) version to access your guest application.

##### Web Components

You can use standalone [react-devtools](https://github.com/facebook/react/tree/master/packages/react-devtools) version to access your guest application.

##### Global

:warning: [Module Federation](https://webpack.js.org/concepts/module-federation/) is a much better way to achieve the same. However you are using Webpack older than version 5 you can use this trick.

Devtools will work perfectly if your host app is **not** build with React.

Otherwise, you can try to share common libraries (like React, ReactDOM) between host and guest app.

The problem is that React declares `__REACT_DEVTOOLS_GLOBAL_HOOK__` on `window` [once](https://github.com/facebook/react/blob/baff5cc2f69d30589a5dc65b089e47765437294b/packages/react-dom/npm/index.js).

This means that only host application's hook will be registered and devtools will not be able to provide access to guest application.

Use `expose-loader` for webpack inside your host application as an elegant way to place your common libraries onto `window`:

```js
const exposedReactDependencies = [
    {
        test: require.resolve('react'),
        use: [
            {loader: 'expose-loader', options: 'React'},
        ],
    },
    {
        test: require.resolve('react-dom'),
        use: [
            {loader: 'expose-loader', options: 'ReactDOM'},
        ],
    },
];

config.module.rules.push(...exposedReactDependencies);
```

Declare those libraries as external inside guest application webpack configuration:

```js
config.externals = {
    ...config.externals,
    react: 'React',
    'react-dom': 'ReactDOM',
};
````

### Hosts without React

Along with React version Web Apps also have Web Components versions. Don't forget [polyfills](#polyfills)!

Usage is very simple:

```js
import '@ringcentral/web-apps-host-web-component';
```

And then anywhere in the page:

```html
<web-app id='react' url='["http://example.com"]' type="iframe" style="..." history="html5" className="..."/>
```

You may implement remote/local registry of apps the same way as in React demo. 

In order to listen to events on the app you need to do following:

```js
import {eventType} from '@ringcentral/web-apps-common';

const app = document.querySelector('web-app');

app.addEventListener('load', () => {
    const onMessage = event => console.log('React App got event', event.detail);
    const node = app.getEventTarget();
    node.addEventListener(eventType.message, onMessage);
});
```

Keep in mind that `web-app` supports dynamic app switching, which means if `id` attribute changes then new app will be loaded, so `load` event may be emitted multiple times (depends on your setup).

### Host-IFrame sync tracking modes

SDK supports multiple sync tracking modes:

- `hash` (default) — IFrame location will be placed in hash of host (for example IFrame has location `/foo/bar` then host will have it as `whatever#/foo/bar`), this mode is needed if you don't quite trust the contents of IFrame and to support completely different routing schemas in IFrame and App
- `full` — IFrame and App will always have same location, useful to display a menu if an IFrame
- `disabled` — No sync
- `slave` — same as full, but IFrame will only follows location changes from Host

You can set mode via attribute on `Component` like so:

- For React host:
    ```html
    <Component tracking="full" />
    ```

- For non-React host:
    ```html
    <rc-app tracking="full" />
    ```

### Authentication

The simplest way to provide authentication information to Web Component or Global app is to set it as an attribute on the `Component`:

- For React host:
    ```html
    <Component authtoken={authtoken} />
    ```

- For non-React host:
    ```html
    <rc-app authtoken={authtoken} />
    ```

See the host demos for more info.

### Apps registry (optional)

You can hardcode all app configs if they never change, but if apps in the system can be dynamic, especially configured at backend, for example based on location main content area may show certain apps, then you'll need a registry.

Applications configs (types & URLS) can be loaded from API or stored locally. This is not part of the SDK, just a recomendation, it could be anything, but in this demo it would be as follows:

```js
export const appsRegistry = {
    react: {
        type: 'global',
        getUrl: async overrideUrl => (overrideUrl || 'http://localhost:4001') + '/global.js'
    },
    vue: {
        type: 'script',
        getUrl: async overrideUrl => (overrideUrl || 'http://localhost:4002') + 'index.js'
    },
    iframe: {
        type: 'iframe',
        getUrl: overrideUrl => (overrideUrl || 'http://localhost:4003') + '/index.html?authToken=hardcoded'
    }
};
```

Demo host app support per-app URL overrides, so that you can set custom URL per app when you open deployed version, in
this case host will still run from CDN and overridden app will run from elsewhere (dev machine for example).

To do so simply open your browser's console and set:

```js
localStorage.appsOverrides = {
    desiredAppId: {url: 'http://localhost:5000'}
};
```

So in order to load App config do this:

```js
await appsRegistry[appId].getUrl(localStorage.appsOverrides && localStorage.appsOverrides[appId].url);
```

`appId` in this case can come from location of the Host app as a parameter `/apps/:appId` (needs extra setup, see the demo host).

### Origins at Host

If you want to bring more security for IFrame apps you can specify origins for both Host and App endpoints like so:

On the host (for React host):

```html
<Component origin="http://example.com" />
```

or for non-React host:

```html
<rc-app origin="http://example.com" />
```

This will check incoming origins and set target origin.

Keep in mind that one app may appear in many Hosts (production, staging) so this might need extra configuration.

## Apps

### Web Component Apps

From host standpoint app injection is as follows:

```js
    const {error, Component, node, loading} = useApplication({
        id: 'xxx',
        type: 'script',
        url: 'http://example.com/script.js'
    });
```

Web Compoent's DOM node can be used to listen to Host events inside the React app, to do that we need to provide a node
to React app which resides inside the Web Component.

The bare minimum what Web Component App must do is simply register the Custom Element following the pattern `web-app-ID` (ID should match the ID on Host):

```js
const template = document.createElement('template');

template.innerHTML = `
    <style>
        /* shadow CSS */
    </style>
`;

customElements.define('web-app-react', class extends HTMLElement { // on the host ID will be react
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(document.importNode(template.content, true));
    }
});
``` 

#### Events

```js
import {dispatchEvent, eventType} from "@ringcentral-web-apps/common";

const template = document.createElement('template');

template.innerHTML = `
    <div></div>
    <button>Send Message</button>
`;

customElements.define('web-app-react', class extends HTMLElement { // on the host ID will be react
    div = null;
    button = null;
    messages = [];
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(document.importNode(template.content, true));

        // get instances of elements in template
        this.div = this.shadowRoot.querySelector('div');
        this.button = this.shadowRoot.querySelector('button');
    }
    connectedCallback(){
        
        // send message on button click
        this.button.addEventListener(e => dispatchEvent(this, eventType.message, {foo: 'bar'}));
    
        // capture message events emitted locally and from host
        this.addEventListener(eventType.message, event => {
            this.messages.push(event.detail);
            this.div.innerText = JSON.stringify(this.messages);        
        });
    }
});
``` 

#### Shadow CSS & Polyfills

Web Components can be shipped with Shadow CSS as in example above, which will not be visible outside of Shadow DOM. All host styles are ignored. Make sure your bundler places styles correctly.

:warning: **Keep in mind that if you target IE browsers then a polyfill will be used which cannot isolate CSS properly, so host styles will be affecting polyfilled Shadow DOM.** 

You may also mount directly into Custom Element, without Shadow DOM, in this case styles & DOM will be consistent in modern and polyfilled browsers:


```js
customElements.define('web-app-react', class extends HTMLElement { // on the host ID will be react
    div = null;
    button = null;
    messages = [];
    constructor() {
        super();
    }
    connectedCallback(){
        this.div = document.createElement('div');
        this.appendChild(this.div);
        // and so on
    }
});
```

#### React-based Web Component Apps

React apps inside Web Components must have `react-shadow-dom-retarget-events` imported due to the bug: https://github.com/spring-media/react-shadow-dom-retarget-events.

```js
// index.js
import React from "react";
import {render, unmountComponentAtNode} from "react-dom";
import retargetEvents from 'react-shadow-dom-retarget-events';
import {App} from './app';

const template = document.createElement('template');

template.innerHTML = `
    <style>
        /* shadow CSS */
    </style>
    <div class="container"></div>
`;

customElements.define('web-app-react', class extends HTMLElement {
    
    mount = null;

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(document.importNode(template.content, true));
        this.mount = this.shadowRoot.querySelector('.container');
        retargetEvents(this.mount);
    }

    static get observedAttributes() {
        return ['authtoken'];
    }

    render() {
        // as you see we re-render every time when authtoken changes
        render(<App authtoken={this.getAttribute('authtoken')} node={this}/>, this.mount);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        unmountComponentAtNode(this);    
    }
    
});
``` 

And then inside the actual React application we wire events the same way as in the [example above](#events), but for React-base apps we provide an SDK to make things easier:

```js
// App.js
import React from "react";
import {dispatchEvent, useListenerEffect, eventType} from "@ringcentral/web-apps-react";

// node and authtoken props are provided by Custom Component wrapper and will be automatically updated if host will change
export default ({node, authtoken}) => {

    // set up local state
    const [messages, setMessages] = useState([]);

    // set up event listener for local & host events
    useListenerEffect(node, eventType.message, event => setMessages(messages => [...messages, event.detail]));

    // set up event dispatcher
    const sendMessage = () => dispatchEvent(node, eventType.message, {toHost: 'message to host'});

    return (<>
        <div>{authtoken}</div>
        <div>{JSON.stringify(messages)}</div>
        <button onClick={sendMessage}>Send message</button>
    </>);

}
```

As you see the code is identical to the React-based Host code.

You may use React Router inside such apps, it will track same location as Host app, for instance one of your Apps can be a Menu and another App can be Content area and Host will render both separately.

### Global Apps JSONP

If you don't need the isolation of the Web Components and you are OK to interfere with global scopes of JS and CSS (hence the name Global Apps) you can use this approach as it's simpler and more direct.

#### Webpack Module Federation Apps

From host standpoint app injection is as follows:

```js
    const {error, Component, node, loading} = useApplication({
        id: 'appId',
        type: 'global',
        url: 'http://example.com/script.js',
        options: {
            federation: true,
            defaultScope: 'default', // scope to store shared modules, optional
            scope: 'web_app_appId', // scope for app modules, optional
            module: './index', // whis file to import modules from, optional
            exportName: 'default', // which export will be taken
        }
    });
```

If messing with Web Components is too much, you can use a simpler way, but it would have less isolation due to complete lack of Shadow DOM and Shadow CSS.

Using [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) we `export default` (or other if configured) callback from the federated module (defaults to `./index`), this callback can do something with the mounted node.

In this mode app's `webpack-config.js` has to be configured in a following way:

```js
const {ModuleFederationPlugin} = require('webpack').container;
const path = require('path');

module.exports = {
    ...,
    plugins: [
        new ModuleFederationPlugin({
            name: 'web_app_federated', // ID on host must match: federated
            library: {type: 'var', name: 'web_app_federated'}, // ID on host must match: federated
            filename: 'remoteEntry.js',
            exposes: {
                // note that host will pick up './index', this is public
                // './src/index' is your internal detail
                './index': './src/index',
            },
            shared: {
                'react-dom': 'react-dom',
                moment: '^2.24.0',
                react: {
                    import: 'react',
                    shareKey: 'react',
                    shareScope: 'default',
                    singleton: true,
                },
            },
        }),
    ],
    ...,
};
```

Now in `src/index.js` may we only need to export default function that will be used as callback to mount the app:

```js
export default (node) => {
    // do something with the provided node
    node.innerText = Date.now();
    return () => {
        // unmount handler
    };
};
```

#### React-based Webpack Module Federation Apps

App code is almost the same as in [React-based Web Component example](#react-based-web-component-apps), but skip the `customElement.define` part.

```js
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

export default (node) => { // ID on host must match: global

    const onChange = () => render(<App authtoken={node.getAttribute('authtoken')} node={node}/>, node);

    const observer = new MutationObserver(mutations =>
        mutations.forEach(
            // re-render on changes
            mutation => mutation.type === 'attributes' && onChange(), // you may also accumulate this instead of calling every time
        ),
    );

    node.addEventListener('remove', () => {
        unmountComponentAtNode(node);
        observer.disconnect();
    });

    observer.observe(node, {attributes: true});

    // initial render
    onChange();

    // unmount handler
    return () => ReactDOM.unmountComponentAtNode(node);

};
```

#### Global Apps JSONP

From host standpoint app injection is as follows:

```js
    const {error, Component, node, loading} = useApplication({
        id: 'xxx',
        type: 'global',
        url: 'http://example.com/script.js'
    });
```

This kind of apps is very similar to [Webpack Module Federation Apps](#webpack-module-federation-apps) but the registration is a bit different, it uses a JSONP-style function: 

```js
import {registerAppCallback} from "@ringcentral/web-apps-common";

registerAppCallback('global', (node) => { // ID on host must match: global
    // do something with the provided node
    node.innerText = Date.now();
    return () => {
        // unmount handler
    };
});
```

:warning: **If you're using Webpack to build Global apps make sure you set `output.jsonpFunction` to something unique to your app so that it will not clash with host's or other apps JSONP function.**

#### React-based Global Apps JSONP

```js
import React from "react";
import {render, unmountComponentAtNode} from "react-dom";
import {registerAppCallback} from "@ringcentral/web-apps-react";
import App from "./App";

registerAppCallback('global', (node) => { // ID on host must match: global
    ReactDOM.render(<App foo={node.getAttribute('foo')} />, node);
    return () => ReactDOM.unmountComponentAtNode(node);
});
```

#### Global Apps in Direct mode

Global apps support a shortcut, if you know that both Host and App are written using the same framework, you can omit the usage of events and interact with `Component` directly.

```js
    const {error, Component, node, loading} = useApplication({
        id: 'xxx',
        type: 'global',
        url: 'http://example.com/script.js',
        options: {
            federation: true, // optional
            direct: true
        }
    });

    return <Component foo="bar" />; // here you can use component as you normally would
```

In Webpack Module Federation mode should simply export the component:

```js
const Cmp = ({node}) => (<div>...</div>); // node will still be provided as prop
export default Cmp;
```

In this case the `registerAppCallback` can be called with React component for example:

```js
const Cmp = ({node}) => (<div>...</div>); // node will still be provided as prop
registerAppCallback('global', Cmp);
``` 

### IFrame Apps

From host standpoint app injection is as follows:

```js
    const {error, Component, node, loading} = useApplication({
        id: 'xxx',
        type: 'iframe',
        url: 'http://example.com/script.js'
    });
```

#### Location Sync

In order to enable location sync we need to create a special synchronization object:

```js
import {IFrameSync} from "@ringcentral/web-apps-sync-iframe";

const iFrameSync = new IFrameSync({history: 'html5', id: 'id-as-registered-on-host'}); // or 'hash' or custom implementation
```

If you have hash history then the URL of the app should end with `#`: `http://localhost:3000#`.

If you'd like to force application to report it's location (for example if you use true HTTP redirects) you may
provide a `sendInitialLocation` flag.

#### Messages

From now on we may use the sync object to send/receive events from the Host application by using `eventTarget` property:

```js
import {dispatchEvent, eventType} from "@ringcentral/web-apps-common";

iFrameSync.getEventTarget().addEventListener(eventType.message, message => {});
dispatchEvent(iFrameSync.getEventTarget(), eventType.message, {foo: 'bar'});
```

#### Popups

```js
dispatchEvent(iFrameSync.getEventTarget(), eventType.popup, 'rgba(0,0,0,0.5)');
```

#### Navigation

```js
dispatchEvent(iFrameSync.getEventTarget(), eventType.location, '/path/on/host?query=string');
```

#### Props

:warning: **Props set at `<Component/>` or `<rc-app/>` are NOT synchronized to IFRame apps at the moment. This feature will be implemented in future**.

#### React-based IFrame Apps

App code is almost the same as in [React-based Web Component example](#react-based-web-component-apps), but the acquisition of `node` to dispatch events and listenen to events is different as it's IFrame app:

```js
// App.js
import React from "react";
import {IFrameSync} from "@ringcentral/web-apps-sync-iframe";
import {dispatchEvent, useListenerEffect, eventType} from "@ringcentral/web-apps-react";

const iFrameSync = new IFrameSync({history: 'html5', id: 'id-as-registered-on-host'}); // or 'hash' or custom implementation
const node = iFrameSync.getEventTarget();

const Page = () => {

    // set up local state
    const [messages, setMessages] = useState([]);

    // set up event listener for local & host events
    useListenerEffect(node, eventType.message, event => setMessages(messages => [...messages, event.detail]));

    // set up event dispatcher
    const sendMessage = () => dispatchEvent(node, eventType.message, {toHost: 'message to host'});

    return (<>
        <div>{JSON.stringify(messages)}</div>
        <button onClick={sendMessage}>Send message</button>
    </>);

}
```

In the example above the history will be synchronized auto-magically, but if you want full control you can supply your instance of `react-router` history like so:

```js
import {IFrameSync} from '@ringcentral/web-apps-sync-iframe';
import {createBrowserHistory} from 'history';
import {Router} from 'react-router-dom';

const history = createBrowserHistory();
const iFrameSync = new IFrameSync({history, id: 'id-as-registered-on-host'});

export default () => (
    <Router history={history}>
        {/* normal route config as usual */}
    </Router>
);
```

#### Origins in Apps

On app-level:

```js
export const sync = new IFrameSync({
    history: 'html5',
    id: 'iframe', // must match host config
    origin: `http://example.com`, // strict mode, remove if you don't know which host is used or add dynamic host determination
});
```

Keep in mind that one app may appear in many Hosts (production, staging) so this might need extra configuration.

#### Non-browserified IFrame applications

For non-browserified applications a pre-built UMD bundle may be used:

```html
<script type="text/javascript" src="node_modules/@ringcentral/web-apps-sync-iframe/dist/ringcentral-web-apps-iframe.js"></script>
```

And then global object `RCApps.IFrameSDK` can be utilized to get all needed utils:

```js
const {eventType, dispatchEvent, IFrameSync} = RCApps.IFrameSDK; // and so on

const sync = new IFrameSync({
    history: 'html5', 
    id: 'id-as-registered-on-host',
    sendInitialLocation: true // useful in apps that does not use HTML5 history and reload on navigation
});
```

## Repo Structure

- `demo`
    - `admin` &mdash; simple demo with full page transitions
    - `host` &mdash; Create React App Host application
    - `iframe` &mdash; Create React App IFrame application
    - `react` &mdash; Webpack React-based Web Component or Global application
    - `vue` &mdash; Webpack Vue-based JS Web Component application
- `packages`
    - `common` &mdash; common application SDK
    - `host` &mdash; SDK for Hosts
    - `host-css` &mdash; common CSS for hosts
    - `host-react` &mdash; React SDK for Hosts
    - `host-web-component` &mdash; Web Component SDK for Hosts
    - `react` &mdash; fix for React Router
    - `sync` &mdash; synchronization SDK
    - `sync-host` &mdash; synchronization SDK for Host
    - `sync-iframe` &mdash; synchronization SDK for IFrame
    - `sync-react` &mdash; React wrapper for IFrame
    - `sync-web-component` &mdash; Web Component for IFrame 

## Demo

```bash
npm install
```

This will install Lerna and all monorepo dependencies.


Put `.env` file in the repo root in order to launch the demo:

```
BROWSER=false
SKIP_PREFLIGHT_CHECK=true

REACT_APP_VERSION=1.0.0

REACT_APP_HOST_PORT=3000
REACT_APP_HOST_WC_PORT=3001
REACT_APP_REACT_PORT=4001
REACT_APP_VUE_PORT=4002
REACT_APP_IFRAME_PORT=4003
REACT_APP_ADMIN_PORT=4005
REACT_APP_REACT_MENU_PORT=4006
REACT_APP_ANGULAR_PORT=4007

REACT_APP_PRODUCTION_HOST=http://localhost
```

Then you can start the watchers/servers:

```bash
npm run start
```

Keep in mind that this will also run watchers in SDKs so it can take a number of rebuilds of demo apps, just wait until
no more messages will pop in terminal.

## Upgrading

### From `0.6.x` to `0.7.x`

1. `<Application nodeRef={xxx}/>` will not work, use `<Application>{({node}) => { ... }}</Application>`

### From `0.4.x` to `0.5.x`

1. Remove `makeHistoryFromRouter` or anything else that normalizes `history` on host, lib now does it internally
2. Rename `registerApp` has been renamed: `import {registerAppCallback} from '@ringcentral/web-apps-common';`
3. Remove `isRetransmittedEvent`, rely on state changes:
    ```diff
    - if (isRetransmittedEvent(event)) this.setState({popup: event.detail});
    + if (this.state.popup !== event.detail) this.setState({popup: event.detail});
    ```
