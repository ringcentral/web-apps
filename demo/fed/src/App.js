import React from 'react';
import moment from 'moment';

export default ({mode}) => (
    <div
        className="border border-info"
        style={{
            borderRadius: '4px',
            padding: '1em',
            display: 'flex',
            alignItems: 'center',
        }}
    >
        <h4 className="font-weight-lighter" style={{margin: '0 10px 0 0'}}>
            Global App (Federated)
        </h4>
        <div>
            Mode: <code>{mode}</code>, {moment().format('MMMM Do YYYY, h:mm:ss a')}
        </div>
    </div>
);
