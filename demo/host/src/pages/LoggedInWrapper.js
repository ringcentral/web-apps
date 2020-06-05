import React, {memo} from 'react';
import {Route, Switch} from 'react-router-dom';
import App from './App';
import Index from './Index';
import {MenuApp} from './MenuApp';
import {MenuAppIframe} from './MenuAppIframe';
import {FederatedApp} from './FederatedApp';

const logout = () => alert('Logout');

const Layout = () => (
    <>
        <MenuApp logout={logout} />
        <MenuAppIframe logout={logout} />

        <Switch>
            <Route path="/application/apps" component={Index} exact />
            <Route path="/application/apps/:appId" component={App} />
        </Switch>

        <FederatedApp />
    </>
);

export default memo(Layout);
