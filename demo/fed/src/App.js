import React from 'react';
import moment from 'moment';

export default ({foo}) => (
    <div
        style={{
            borderRadius: '4px',
            padding: '2em',
            backgroundColor: 'red',
            color: 'white',
        }}
    >
        <h2>App 2 Widget: {foo}</h2>
        <p>{moment().format('MMMM Do YYYY, h:mm:ss a')}</p>
    </div>
);
