import React, {memo, useState, useCallback} from 'react';
import {useApplication, eventType, useListenerEffect, dispatchEvent} from '@ringcentral/web-apps-host-react';
import {useAppRegistry} from '../lib/useAppRegistry';

/**
 * Note that this function is exactly the same as in IFRAME and React app
 */
const Messages = ({node}) => {
    const [messages, setMessages] = useState([]);

    useListenerEffect(node, eventType.message, event => setMessages(messages => [...messages, event.detail]));

    const sendMessage = () => dispatchEvent(node, eventType.message, {toApp: 'message to app'});

    return (
        <p className="input-group">
            <span className="input-group-prepend">
                <button className="btn btn-outline-primary" onClick={sendMessage}>
                    Send message
                </button>
            </span>
            <input type="text" className="form-control" name="messages" value={JSON.stringify(messages)} readOnly />
        </p>
    );
};

const App = ({
    match: {
        params: {appId},
    },
}) => {
    const [authtoken, setAuthToken] = useState('set-by-host');
    const {id, url, type, error: registryError, loading: registryLoading, origin, options} = useAppRegistry(appId);

    const {error: appError, Component, node, loading: appLoading} = useApplication({id, type, url, options});

    const [popup, setPopup] = useState(false);
    const onPopup = useCallback(event => setPopup(popup => (popup !== event.detail ? event.detail : popup)), []);
    useListenerEffect(node, eventType.popup, onPopup);

    const onAuthError = useCallback(event => alert('App reported auth error:\n\n' + event.detail), []); //this.props.history.push('/login'); //FIXME Logout
    useListenerEffect(node, eventType.authError, onAuthError);

    // Render

    let render;
    if (registryError) render = <p>Cannot load application: {registryError.toString()}</p>;
    else if (appError) render = <p>Cannot render application: {appError.toString()}</p>;
    else if (registryLoading) render = <p>Loading registry...</p>;
    else if (!Component) render = <p>Loading app...</p>;
    else
        render = (
            <Component
                authtoken={authtoken}
                {...(type === 'iframe'
                    ? {
                          className: 'app-iframe',
                          origin, // strict mode
                      }
                    : {})}
            />
        );

    return (
        <div className={popup ? 'app-popup' : ''}>
            <div
                className="app-popup-bg"
                onClick={e => dispatchEvent(node, eventType.popup, false)}
                style={{backgroundColor: popup}}
                role="presentation"
            />

            <div className="card border-primary">
                <div className="card-header">App</div>
                <div className="card-body">
                    {render}
                    {appLoading && <p>Application is mounting</p>}
                </div>
            </div>

            <div className="card border-success">
                <div className="card-header">Host</div>
                <div className="card-body">
                    <p className="input-group">
                        <span className="input-group-prepend">
                            <button className="btn btn-outline-primary" onClick={() => setAuthToken(authtoken + 'X')}>
                                Bump authtoken
                            </button>
                        </span>
                        <input type="text" className="form-control" name="authToken" value={authtoken} readOnly />
                    </p>

                    <Messages node={node} />
                </div>
            </div>
        </div>
    );
};

export default memo(App);
