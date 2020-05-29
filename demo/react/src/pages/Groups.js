import React from 'react';
import {Prompt} from 'react-router-dom';

export default () => (
    <p>
        <Prompt when={true} message={location => `Are you sure you want to go to ${location.pathname}`} />
        <strong>Groups page</strong> loaded as a chunk using dynamic <code>import()</code>
    </p>
);
