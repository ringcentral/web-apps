import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {LocationSync} from '@ringcentral/web-apps-host-react';
import Menu from './Menu';

export default ({node}) => (
    <BrowserRouter>
        <LocationSync />
        <Menu node={node} />
    </BrowserRouter>
);
