import React from 'react';
import {createBrowserHistory} from 'history';
import {Route, Switch, Redirect, Router} from 'react-router-dom';
import {LocationSync} from '@ringcentral/web-apps-host-react';

import LoggedInWrapper from './pages/LoggedInWrapper';
import AuthLanding from './pages/AuthLanding';
import NotFound from './pages/NotFound';

// This allows to block history in sub-apps, this is not required in general
window.RCAppsDemoHistory = createBrowserHistory();

export default () => (
    <Router history={window.RCAppsDemoHistory}>
        <LocationSync />
        <Switch>
            <Route path="/application/apps" component={LoggedInWrapper} />
            <Route path="/web/success" component={AuthLanding} />
            <Redirect from="/" to="/application/apps" />
            <Route component={NotFound} />
        </Switch>
    </Router>
);
