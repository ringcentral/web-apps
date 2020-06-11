import React, {memo} from 'react';
import {Route, Switch} from 'react-router-dom';
import App from './App';
import Index from './Index';
import {MenuApp} from './MenuApp';
import {MenuAppIframe} from './MenuAppIframe';
import {FederationApp} from './FederationApp';
import {FederationDirectApp} from './FederationDirectApp';

const logout = () => alert('Logout');

const Layout = ({match}) => (
    <>
        <MenuApp logout={logout} />
        <MenuAppIframe logout={logout} />

        <Switch>
            <Route path={`${match.url}`} component={Index} exact />
            <Route path={`${match.url}/:appId`} component={App} />
        </Switch>

        <FederationApp />
        <FederationDirectApp />
    </>
);

export default memo(Layout);
