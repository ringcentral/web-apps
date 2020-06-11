import React from 'react';
import {Router} from 'react-router-dom';
import {LocationSync} from '@ringcentral/web-apps-react';
import Menu from './Menu';

// This allows to block history in sub-apps, this is not required in general
export default ({node}) => (
    <Router history={window.RCAppsDemoHistory}>
        <LocationSync />
        <Menu node={node} />
    </Router>
);
