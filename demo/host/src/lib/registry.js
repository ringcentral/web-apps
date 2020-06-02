// This could be any other provisioning method
const fetchManifest = async url => (await fetch(`${url}/asset-manifest.json`)).json();

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
        getUrl: async (url = `http://localhost:${process.env.REACT_APP_REACT_MENU_PORT}`) =>
            getFilesFromManifest(url, await fetchManifest(url)),
    },
    reactMenuIframe: {
        type: 'iframe',
        origin: `http://localhost:${process.env.REACT_APP_REACT_MENU_IFRAME_PORT}`,
        getUrl: async (url = `http://localhost:${process.env.REACT_APP_REACT_MENU_IFRAME_PORT}`) => url,
    },
    global: {
        type: 'global',
        getUrl: async (url = `http://localhost:${process.env.REACT_APP_REACT_PORT}`) =>
            getFilesFromManifest(url, await fetchManifest(url)),
    },
    vue: {
        type: 'script',
        getUrl: (url = `http://localhost:${process.env.REACT_APP_VUE_PORT}`) => [
            `${url}/js/app.js`,
            `${url}/js/chunk-vendors.js`,
        ],
    },
    iframe: {
        type: 'iframe',
        origin: `http://localhost:${process.env.REACT_APP_IFRAME_PORT}`,
        getUrl: (url = `http://localhost:${process.env.REACT_APP_IFRAME_PORT}`) => url, // add # to URL enable hash history in IFRAME
    },
    admin: {
        type: 'iframe',
        origin: `http://localhost:${process.env.REACT_APP_ADMIN_PORT}`,
        getUrl: (url = `http://localhost:${process.env.REACT_APP_ADMIN_PORT}`) => url,
    },
    angular: {
        type: 'script',
        getUrl: (url = `http://localhost:${process.env.REACT_APP_ANGULAR_PORT}`) => [
            url + `/runtime.js`,
            url + `/polyfills.js`,
            url + `/styles.js`,
            url + `/vendor.js`,
            url + `/main.js`,
        ],
    },
    federated: {
        type: 'federated',
        getUrl: async (url = `http://localhost:${process.env.REACT_APP_FED_PORT}`) => url + '/remoteEntry.js',
    },
};
