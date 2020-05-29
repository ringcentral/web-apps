export const postMessageProperty = 'web-apps-message-';
export const postMessageEvent = 'message';

export const sendPostMessage = (frame, id, data, targetOrigin = '*') => {
    // console.log('Sending from', location.origin, {id, data, targetOrigin});
    frame.postMessage({[postMessageProperty + id]: data}, targetOrigin);
};

export const postMessageListener = ({id, safeOrigin = null, callback}) => ({origin, data}) => {
    // if (data && (!data.includes || !data.includes('[iFrameSizer]')))
    //     console.log('Receiving at', location.origin, 'from', {id, origin, safeOrigin, data});

    if (safeOrigin && origin !== safeOrigin) return;
    if (!data) return;

    const message = data[postMessageProperty + id];
    if (!message) return;

    callback(message);
};
