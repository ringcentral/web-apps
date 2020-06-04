import Vue from 'vue/dist/vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const Root = {template: '<div>Root!</div>'};
const Bar = {template: '<div>Bar</div>'};

const router = new VueRouter({
    mode: 'history',
    routes: [{path: '/application/apps/vue', component: Root}, {path: '/application/apps/vue/bar', component: Bar}],
});

const template = document.createElement('template');
template.innerHTML = `
    <style>
        .router-link-exact-active {
            font-weight: bold;
            text-decoration: none;
        }
    </style>
    <div class="container"></div>
`;

customElements.define(
    'web-app-vue',
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(document.importNode(template.content, true));
            this.mount = this.shadowRoot.querySelector('.container');

            this.app = new Vue({
                router,
                template: `
                  <div id="vue">
                    <p>
                      <router-link to="/application/apps/vue">Root</router-link>
                      <router-link to="/application/apps/vue/bar">Bar</router-link>
                    </p>
                    <router-view></router-view>
                    <hr/>
                    <ul>
                      <li><router-link to="/application/apps/global/groups">React app deep (Groups)</router-link></li>
                      <li><router-link to="/application/apps/global">React app</router-link></li>
                      <li><router-link to="/application/apps/iframe#/app/bar">Iframe app deep</router-link></li>
                    </ul>
                  </div>
            `.trim(),
            });
        }

        connectedCallback() {
            this.app.$mount(this.mount); // Vue REPLACES mount point
        }

        disconnectedCallback() {
            this.app.$destroy();
        }
    },
);
