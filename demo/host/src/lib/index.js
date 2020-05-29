import SDK from '@ringcentral/sdk';

console.log('API Server', process.env.REACT_APP_API_SERVER);

export const sdk = new SDK({
    authProxy: true,
    urlPrefix: '/api',
    authorizeEndpoint: '/wap/authorize',
    server: process.env.REACT_APP_API_SERVER,
    clientId: process.env.REACT_APP_HOST_CLIENT_ID, // use HOST clientId here
});

export const loginUrl = state => sdk.platform().loginUrl({state});

const interopCode = async clientId =>
    (await sdk.platform().post(`/restapi/v1.0/interop/generate-code`, {clientId})).json();

// ATTENTION! Landing page has to be last parameter because HostSync will append additional path to it
// Technically this and /interop/generate-code should be blended into one endpoint
const launchProxy = ({url, code, clientId}) =>
    `${process.env.REACT_APP_API_SERVER}/apps/${clientId}/api/wap/launch?code=${code}&landing_page_uri=${url}`;

export const bootstrapApp = async (url, clientId) => {
    const {code} = await interopCode(clientId);
    return launchProxy({url, code, clientId}); // add # to URL enable hash history in IFRAME
};

export const locationToState = location => JSON.stringify(location);
export const stateToLocation = state => JSON.parse(state);
