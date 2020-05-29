import {HostSync} from '@ringcentral/web-apps-sync-host';
import {makeEvent} from '@ringcentral/web-apps-common';

/**
 * @see https://github.com/w3c/webcomponents/issues/565#issuecomment-345556883
 * @param callback
 * @returns {MutationObserver}
 */
export const createMutationObserver = callback =>
    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                let newVal = mutation.target['getAttribute'](mutation.attributeName);
                callback(mutation.attributeName, newVal);
            }
        });
    });

if (!customElements.get('web-app-sync-iframe'))
    customElements.define(
        'web-app-sync-iframe',
        class extends HTMLElement {
            private sync: HostSync;
            private observer: MutationObserver;

            public constructor() {
                super();
                // this.attachShadow({mode: 'open'});
                this.observer = createMutationObserver(this.attributeChanged);
            }

            public getNode() {
                return this.firstElementChild as HTMLIFrameElement;
            }

            public connectedCallback() {
                // could be this.shadowRoot but we WANT parent styles here to style iframes/error messages/loaders ETC
                this.innerHTML = `<iframe src="" title="synchronized-iframe" scrolling="no" frameborder="no" />`;
                const iframe = this.getNode();

                this.sync = new HostSync({
                    id: this.getAttribute('id'),
                    url: this.getAttribute('url'),
                    iframe,
                    history: this.getAttribute('history') as any,
                    tracking: this.getAttribute('tracking') as any,
                    minHeight: this.getAttribute('min-height') as any,
                    origin: this.getAttribute('origin') as any,
                });

                this.observer.observe(this, {attributes: true});
                this.dispatchEvent(makeEvent('load'));
            }

            public disconnectedCallback() {
                this.sync.destroy();
                this.observer.disconnect();
            }

            public attributeChanged = (name, newValue) => {
                if (!this.getNode()) return;
                this.getNode().setAttribute(name, newValue);
            };

            public getEventTarget() {
                return this.getNode();
            }
        },
    );
