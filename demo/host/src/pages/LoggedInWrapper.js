import React, {memo} from 'react';
import {Route, Switch} from 'react-router-dom';
import App from './App';
import Index from './Index';
import {useAuthGate} from '../lib/useAuthGate';
import {locationToState, loginUrl} from '../lib';
import {MenuApp} from './MenuApp';
import {MenuAppIframe} from './MenuAppIframe';

const Layout = ({children, match, location}) => {
    const {authorizing, authorized, logout} = useAuthGate(); //TODO Use error

    if (authorizing) {
        return <div className="lead text-center">Authorizing...</div>;
    }

    if (!authorized) {
        window.location = loginUrl(locationToState(location)); // side effect
        return <div className="lead text-center">Redirecting...</div>;
    }

    return (
        <>
            <MenuApp logout={logout} />
            <MenuAppIframe logout={logout} />

            <Switch>
                <Route path="/application/apps" component={Index} exact />
                <Route path="/application/apps/:appId" component={App} />
            </Switch>
        </>
    );
};

export default memo(Layout);
