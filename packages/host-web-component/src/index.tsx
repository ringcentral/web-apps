import {createMutationObserver} from '@ringcentral/web-apps-sync-web-component';
import {createApp, App, ScriptApp} from '@ringcentral/web-apps-host';
import {getAppCallback, makeEvent} from '@ringcentral/web-apps-common';

export * from '@ringcentral/web-apps-common';

const doNotSyncAttributes = ['id', 'type', 'url', 'history'];

if (!customElements.get('web-app'))
    customElements.define(
        'web-app',
        class extends HTMLElement {
            protected app: App = null;
            protected observer: MutationObserver = null;
            protected error = null;

            public constructor() {
                super();
                // this.attachShadow({mode: 'open'});
                this.observer = createMutationObserver(this.attributeChanged);
            }

            protected render({id, url, type}) {
                let node;

                switch (type) {
                    case 'script':
                        const {tag} = this.app as ScriptApp;
                        const Tag = tag() as any;
                        node = document.createElement(Tag);
                        break;

                    case 'iframe':
                        const history = this.getAttribute('history');
                        if (!history) throw new Error('History not defined');
                        node = document.createElement('web-app-sync-iframe');
                        node.setAttribute('id', id);
                        node.setAttribute('url', Array.isArray(url) ? url[0] : url);
                        node.setAttribute('history', history);
                        break;

                    case 'global':
                        node = document.createElement('div');
                        break;

                    default:
                        throw new Error('Unknown app type ' + type);
                }

                // could be this.shadowRoot but we WANT parent styles here to style iframes/error messages/loaders ETC
                this.innerHTML = '';
                this.appendChild(node);

                // Initial sync of attributes
                Object.values(this.attributes)
                    .filter(attr => !doNotSyncAttributes.includes(attr.name))
                    .forEach(attr => {
                        node.setAttribute(attr.name, this.getAttribute(attr.name));
                    });

                if (type === 'global') getAppCallback(id)(node);
            }

            protected async loadApp() {
                const id = this.getAttribute('id');
                const rawUrl = this.getAttribute('url');
                const type = this.getAttribute('type');

                if (!id) throw new Error('ID not defined');
                if (!rawUrl) throw new Error('ID not defined');
                if (!type) throw new Error('ID not defined');

                const url = JSON.parse(rawUrl);

                this.dispatchEvent(makeEvent('beforeload', {id, type, url}));
                console.warn('WEB COMPONENT HOST: App ID has changed', id, type);

                try {
                    //TODO [UIA-10000] Custom loading
                    this.innerHTML = `<div>Loading...</div>`;
                    this.app = null;
                    this.error = null;
                    this.app = await createApp({id, url, type});
                    await this.render({id, url, type});
                    this.dispatchEvent(makeEvent('load', {id, type, url}));
                } catch (error) {
                    this.error = error;
                    //TODO [UIA-10000] Custom loading
                    this.innerHTML = `<div>Cannot load app ${id}: ${error.message}</div>`;
                    console.error('WEB COMPONENT HOST: Cannot load app', id, error);
                    this.dispatchEvent(makeEvent('error', {id, type, url, error}));
                }
            }

            public async connectedCallback() {
                await this.loadApp();
                this.observer.observe(this, {attributes: true});
            }

            public async disconnectedCallback() {
                this.observer.disconnect();
            }

            protected getNode() {
                return this.firstElementChild;
            }

            protected attributeChanged = async (name, newValue) => {
                if (name === 'id') {
                    return await this.loadApp(); // this is handled in connectedCallback
                }

                if (doNotSyncAttributes.includes(name)) return;
                this.getNode().setAttribute(name, newValue);
            };

            public getEventTarget() {
                const node = this.getNode();
                //FIXME [UIA-10000] Node may change and we need uniform way to access the eventTarget
                return 'getEventTarget' in node ? (node as any).getEventTarget() : node;
            }
        },
    );
