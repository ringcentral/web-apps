import React from 'react';
import {Route, Switch, Redirect, BrowserRouter} from 'react-router-dom';

import App from './pages/App';
import NotFound from './pages/NotFound';

const prefix = process.env.NODE_ENV === 'production' ? '/demo/iframe/build' : '';

export default () => (
    <BrowserRouter>
        <Switch>
            <Route path={`${prefix}/app`} component={App} />
            <Redirect path={`${prefix}/`} to={`${prefix}/app`} />
            <Route component={NotFound} />
        </Switch>
    </BrowserRouter>
);
