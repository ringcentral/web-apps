import React, {useState} from 'react';
import {NavLink, Route, Switch} from 'react-router-dom';
import {Modal, Button} from 'react-bootstrap';
import {eventType, useListenerEffect, dispatchEvent} from '@ringcentral/web-apps-react';
import {sync} from '../lib';
import Foo from './Foo';
import Bar from './Bar';
import Index from './Index';
import Lorem from './Lorem';

const PopupWindow = ({close}) => (
    <Modal onHide={close} show={true}>
        <Modal.Header>
            <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Lorem />
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={close}>Close</Button>
        </Modal.Footer>
    </Modal>
);

/**
 * Note that this function is exactly the same as in HOST-rendered React app
 */
const Messages = ({node}) => {
    const [messages, setMessages] = useState([]);

    useListenerEffect(node, eventType.message, event => setMessages(messages => [...messages, event.detail]));

    const sendMessage = () => dispatchEvent(node, eventType.message, {fromIframe: 'pew'});

    return (
        <p className="input-group">
            <span className="input-group-prepend">
                <button className="btn btn-outline-primary" onClick={sendMessage}>
                    Send message
                </button>
            </span>
            <input type="text" className="form-control" value={JSON.stringify(messages)} readOnly />
        </p>
    );
};

/**
 * This app is rendered in IFRAME so unline in HOST-rendered React app we need to synchronize popups
 */
const Popup = ({node}) => {
    const [popup, setPopup] = useState(false);

    const togglePopup = (popup = false) => dispatchEvent(node, eventType.popup, popup && 'rgba(0, 0, 0, 0.5)'); // sets color of host popup background

    useListenerEffect(node, eventType.popup, event => setPopup(event.detail));

    return (
        <p>
            <button className="btn btn-outline-primary" onClick={() => togglePopup(true)}>
                Popup
            </button>
            {popup && <PopupWindow close={() => togglePopup(false)} />}
        </p>
    );
};

const App = ({match, location}) => {
    const node = sync.getEventTarget();

    const openOnHost = location => dispatchEvent(node, eventType.location, location); // replace origin just in case

    return (
        <>
            <nav className="top-menu">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <NavLink to={`${match.url}`} className="nav-link" exact>
                            Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={`${match.url}/foo`} className="nav-link">
                            Foo
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={`${match.url}/bar`} className="nav-link">
                            Bar
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <a
                            href="/"
                            className="nav-link"
                            onClick={e => openOnHost('/application/apps/vue/bar') && e.preventDefault()}
                        >
                            Go deep into Vue app
                        </a>
                    </li>
                </ul>
            </nav>

            <Switch>
                <Route path={`${match.url}`} component={Index} exact />
                <Route path={`${match.url}/foo`} component={Foo} />
                <Route path={`${match.url}/bar`} component={Bar} />
            </Switch>

            <Popup node={node} />
            <Messages node={node} />

            <p className="input-group">
                <span className="input-group-prepend">
                    <span className="input-group-text">Location</span>
                </span>
                <input type="text" className="form-control" value={JSON.stringify(location)} readOnly />
            </p>
        </>
    );
};

export default App;
