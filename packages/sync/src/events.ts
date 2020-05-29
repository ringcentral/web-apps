import {eventType, makeEvent} from '@ringcentral/web-apps-common';

const retransmittedProperty = 'retransmitted';

//FIXME We can't extend CustomEvent due to a bug https://github.com/Microsoft/TypeScript/issues/12949 and https://stackoverflow.com/q/37039638
export const makeRetransmittedEvent = (type: eventType, data?) => {
    const event = makeEvent(type, data);
    event[retransmittedProperty] = true;
    return event;
};

export const isRetransmittedEvent = event => event.hasOwnProperty(retransmittedProperty);
