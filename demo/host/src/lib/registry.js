// This could be any other provisioning method
const fetchManifest = async url => (await fetch(`${url}/asset-manifest.json`)).json();

const angularSuffix = process.env.NODE_ENV === 'production' ? '-es5' : '';

// Special treatment of Create React App manifest
const getFilesFromManifest = (url, manifest) =>
    [
        'runtime~main.js',
        ...Object.keys(manifest.files).filter(key => key.match(/static\/js\/.+\.chunk.js$/)),
        'main.js',
    ].map(key => `${url}/${manifest.files[key]}`);

export const appRegistry = {
    react: {
        type: 'script',
        getUrl: async (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/react-menu/build`
                : `http://localhost:${process.env.REACT_APP_REACT_MENU_PORT}`,
        ) => getFilesFromManifest(url, await fetchManifest(url)),
    },
    reactMenuIframe: {
        type: 'iframe',
        origin:
            process.env.NODE_ENV === 'production'
                ? window.location.origin
                : `http://localhost:${process.env.REACT_APP_REACT_MENU_IFRAME_PORT}`,
        getUrl: async (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/react-menu-iframe/build/`
                : `http://localhost:${process.env.REACT_APP_REACT_MENU_IFRAME_PORT}`,
        ) => url,
    },
    global: {
        type: 'global',
        getUrl: async (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/react/build`
                : `http://localhost:${process.env.REACT_APP_REACT_PORT}`,
        ) => getFilesFromManifest(url, await fetchManifest(url)),
    },
    vue: {
        type: 'script',
        getUrl: (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/vue/dist`
                : `http://localhost:${process.env.REACT_APP_VUE_PORT}`,
        ) => [`${url}/js/app.js`, `${url}/js/chunk-vendors.js`],
    },
    iframe: {
        type: 'iframe',
        origin:
            process.env.NODE_ENV === 'production'
                ? window.location.origin
                : `http://localhost:${process.env.REACT_APP_IFRAME_PORT}`,
        getUrl: (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/iframe/build`
                : `http://localhost:${process.env.REACT_APP_IFRAME_PORT}`,
        ) => url, // add # to URL enable hash history in IFRAME
    },
    admin: {
        type: 'iframe',
        origin:
            process.env.NODE_ENV === 'production'
                ? window.location.origin
                : `http://localhost:${process.env.REACT_APP_ADMIN_PORT}`,
        getUrl: (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/admin`
                : `http://localhost:${process.env.REACT_APP_ADMIN_PORT}`,
        ) => url,
    },
    angular: {
        type: 'script',
        getUrl: (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/angular/dist`
                : `http://localhost:${process.env.REACT_APP_ANGULAR_PORT}`,
        ) => [
            url + `/runtime${angularSuffix}.js`,
            url + `/polyfills${angularSuffix}.js`,
            url + `/styles${angularSuffix}.js`,
            url + `/vendor${angularSuffix}.js`,
            url + `/main${angularSuffix}.js`,
        ],
    },
    federation: {
        type: 'global',
        getUrl: async (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/fed/dist`
                : `http://localhost:${process.env.REACT_APP_FED_PORT}`,
        ) => url + '/remoteEntry.js',
        options: {
            federation: true,
        },
    },
    federationDirect: {
        type: 'global',
        getUrl: async (
            url = process.env.NODE_ENV === 'production'
                ? `/demo/fed/dist`
                : `http://localhost:${process.env.REACT_APP_FED_PORT}`,
        ) => url + '/remoteEntry.js',
        options: {
            federation: true,
            module: './App',
            scope: 'web_app_federation',
        },
    },
};
