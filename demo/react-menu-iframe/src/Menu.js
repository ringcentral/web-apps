import React from 'react';
import {NavLink} from 'react-router-dom';
import {dispatchEvent, eventType} from '@ringcentral/web-apps-react';
import {IFrameSync} from '@ringcentral/web-apps-sync-iframe';

const sync = new IFrameSync({
    history: 'html5',
    id: 'reactMenuIframe',
    origin:
        process.env.NODE_ENV === 'production'
            ? window.location.origin
            : `http://localhost:${process.env.REACT_APP_HOST_PORT}`, // strict mode, remove if you don't know the host
}); // must match host config

const node = sync.getEventTarget();

export default () => (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <ul className="navbar-nav" style={{flex: 1}}>
            <li className="nav-item active">
                <NavLink to="/application/apps" className="nav-link" exact>
                    Home
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/application/apps/global" className="nav-link">
                    Global
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/application/apps/vue" className="nav-link">
                    Vue
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/application/apps/iframe" className="nav-link">
                    IFrame
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/application/apps/admin" className="nav-link">
                    Admin
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/application/apps/angular" className="nav-link">
                    Angular
                </NavLink>
            </li>
        </ul>
        <small className="navbar-text" style={{marginRight: '1rem'}}>
            Whole menu is an app that listens to routing in IFRAME
        </small>
        <button
            className="btn btn-outline-danger"
            onClick={e => dispatchEvent(node, eventType.message, {logout: true})}
        >
            Logout
        </button>
    </nav>
);
