import {makeEvent, eventType} from '@ringcentral/web-apps-common';

const root = document.getElementById('app');

const fetchManifest = async url => (await fetch(`${url}/asset-manifest.json`)).json();

// Special treatment of Create React App manifest
const getFilesFromManifest = (url, manifest) =>
    [
        'runtime~main.js',
        ...Object.keys(manifest.files).filter(key => key.match(/static\/js\/.+\.chunk.js$/)),
        'main.js',
    ].map(key => `${url}/${manifest.files[key]}`);

(async () => {
    const url = `http://localhost:${process.env.REACT_APP_REACT_PORT}`;
    const resolvedUrl = getFilesFromManifest(url, await fetchManifest(url));

    const reactApp = document.createElement('web-app');
    reactApp.setAttribute('url', JSON.stringify(resolvedUrl));
    reactApp.setAttribute('id', 'global');
    reactApp.setAttribute('type', 'global');
    reactApp.setAttribute('history', 'html5');
    reactApp.setAttribute('authtoken', 'set-by-host');
    reactApp.addEventListener('load', () => {
        reactApp
            .getEventTarget()
            .addEventListener(eventType.message, event => console.log('React App got event', event.detail));
    });
    root.appendChild(reactApp);

    const bumpAttrButton = document.createElement('button');
    bumpAttrButton.innerText = 'Bump authToken';
    bumpAttrButton.addEventListener('click', () => {
        reactApp.setAttribute('authtoken', reactApp.getAttribute('authtoken') + 'X');
    });
    root.appendChild(bumpAttrButton);

    const sendMessageButton = document.createElement('button');
    sendMessageButton.innerText = 'Send message';
    sendMessageButton.addEventListener('click', () => {
        reactApp.dispatchEvent(makeEvent(eventType.message, {toApp: 'Message from host'}));
    });
    root.appendChild(sendMessageButton);
})();
