/* eslint-disable import/no-webpack-loader-syntax */

import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';
import App from './Router';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        /* ATTENTION! @import IS NOT SUPPORTED HERE! WE HAVE TO USE RAW LOADER INSTEAD */
        /* FIXME This isolation does not work in IE  */
        ${require('!raw-loader!bootstrap/dist/css/bootstrap.css').default}
        ${require('!raw-loader!./style.css').default}
    </style>
    <div class="root"></div>
`;

// this does not survive hot reload, as custom element can't be redefined
// @see https://stackoverflow.com/questions/47805288/modifying-a-custom-element-class-after-its-been-defined
if (!customElements.get('web-app-react'))
    customElements.define(
        'web-app-react',
        class extends HTMLElement {
            constructor() {
                super();

                this.attachShadow({mode: 'open'});
                this.shadowRoot.appendChild(document.importNode(template.content, true));
                this.mount = this.shadowRoot.querySelector('.root');

                retargetEvents(this.mount);
            }

            static get observedAttributes() {
                return ['authtoken'];
            }

            render() {
                // as you see we re-render every time when authtoken changes
                render(<App node={this} />, this.mount);
            }

            attributeChangedCallback(name, oldValue, newValue) {
                this.render();
            }

            connectedCallback() {
                this.render();
            }

            disconnectedCallback() {
                unmountComponentAtNode(this.mount);
            }
        },
    );
