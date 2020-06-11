import React from 'react';
import {Route, Switch, Redirect, BrowserRouter} from 'react-router-dom';

import App from './pages/App';
import NotFound from './pages/NotFound';

export default () => (
    <BrowserRouter>
        <Switch>
            <Route path="/app" component={App} />
            <Redirect path="/" to="/app" />
            <Route component={NotFound} />
        </Switch>
    </BrowserRouter>
);
