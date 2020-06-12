import React, {useState, useEffect, Suspense, lazy} from 'react';
import {BrowserRouter, Router, NavLink, Route, Switch} from 'react-router-dom';
import {eventType, LocationSync, dispatchEvent, useListenerEffect} from '@ringcentral/web-apps-react';
import Modal from './Modal';

import './styles.css'; // even though this is imported it won't make any effect in Web Component mode due to Shadow CSS

const Groups = lazy(() => import('./pages/Groups'));
const Users = lazy(() => import('./pages/Users'));

/**
 * Note that this function is exactly the same as in IFRAME app
 */
const Messages = ({node}) => {
    const [messages, setMessages] = useState([]);

    useListenerEffect(node, eventType.message, event => setMessages(messages => [...messages, event.detail]));

    const sendMessage = () => dispatchEvent(node, eventType.message, {toHost: 'message to host'});

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

/**
 * This app is rendered in HOST frame so no need to hassle with popups since it's the same frame and DOM
 */
const Popup = () => {
    const [popup, togglePopup] = useState(false);

    return (
        <>
            {popup && (
                <Modal>
                    <div className="modal-backdrop fade show" />
                    <div
                        className="modal fade show"
                        tabIndex="-1"
                        role="presentation"
                        onClick={() => togglePopup(false)}
                        onKeyPress={e => null}
                        style={{display: 'block'}}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-body">Sample modal</div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => togglePopup(false)}
                                    >
                                        Understood
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            <p>
                <button className="btn btn-outline-primary" onClick={() => togglePopup(true)}>
                    Popup
                </button>
            </p>
        </>
    );
};

const App = ({node, match: {url}, authtoken}) => {
    useEffect(() => {
        console.log('REACT: Mounting'); // lifecycle demo
        return () => console.log('REACT: Un-Mounting'); // lifecycle demo
    }, []);

    const base = url.endsWith('/') ? url.substr(0, url.length - 1) : url;

    return (
        <>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <NavLink to={`${base}/`} className="nav-link" exact>
                        Users
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to={`${base}/groups`} className="nav-link">
                        Groups
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/application/apps/vue/bar" className="nav-link">
                        Deep in Vue
                    </NavLink>
                </li>
            </ul>

            <Suspense
                fallback={
                    <p>
                        Loading page as a chunk using dynamic <code>import()</code>...
                    </p>
                }
            >
                <Switch>
                    <Route path={`${base}/groups`} component={Groups} />
                    <Route component={Users} />
                </Switch>
            </Suspense>

            <Popup />
            <Messages node={node} />

            <p className="input-group">
                <span className="input-group-prepend">
                    <span className="input-group-text">
                        authtoken&nbsp;<small>(this was provided by host)</small>
                    </span>
                </span>
                <input type="text" className="form-control" name="authToken" value={authtoken} readOnly />
            </p>
        </>
    );
};

export default props => {
    const routes = (
        <>
            <LocationSync />
            <Route path="/application/apps/:appId" render={({match}) => <App {...props} match={match} />} />
        </>
    );

    // This allows to block history in sub-apps, this is not required in general
    return window.RCAppsDemoHistory ? (
        <Router history={window.RCAppsDemoHistory}>{routes}</Router>
    ) : (
        <BrowserRouter>{routes}</BrowserRouter>
    );
};
