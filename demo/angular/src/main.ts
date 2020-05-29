import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';

const platformRef = platformBrowserDynamic();

// this does not survive hot reload, as custom element can't be redefined
// @see https://stackoverflow.com/questions/47805288/modifying-a-custom-element-class-after-its-been-defined
if (!customElements.get('web-app-angular'))
    customElements.define(
        'web-app-angular',
        class extends HTMLElement {
            protected mount;

            public connectedCallback() {
                this.mount = document.createElement('app-root');
                this.appendChild(this.mount);
                platformRef.bootstrapModule(AppModule).catch(err => console.error(err));
            }

            public disconnectedCallback() {
                this.innerHTML = '';
            }
        },
    );
