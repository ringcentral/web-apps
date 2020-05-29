import {eventType} from '@ringcentral/web-apps-common';

const root = document.getElementById('app');

// IFRAME APP

const iframeApp = document.createElement('web-app');
iframeApp.setAttribute('url', JSON.stringify([`http://localhost:${process.env.REACT_APP_IFRAME_PORT}`]));
iframeApp.setAttribute('id', 'iframe');
iframeApp.setAttribute('type', 'iframe');
iframeApp.setAttribute('history', 'html5');
iframeApp.setAttribute('class', 'app-iframe');
iframeApp.addEventListener('load', () => {
    console.log('load', iframeApp.getEventTarget());
    iframeApp
        .getEventTarget()
        .addEventListener(eventType.message, event => console.log('React App got event', event.detail));
});
root.appendChild(iframeApp);
