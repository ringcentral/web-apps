import React, {memo, useEffect, useState} from 'react';
import {appRegistry} from '../lib/registry';
import {useApplication, useListenerEffect, eventType} from '@ringcentral/web-apps-host-react';

const id = 'reactMenuIframe';

export const MenuAppIframe = memo(({logout}) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        let mounted = true;
        appRegistry[id].getUrl().then(url => mounted && setUrl(url));
        return () => (mounted = false);
    }, []);

    const {error, loading, Component, node} = useApplication({
        id,
        type: appRegistry[id].type,
        url,
    });

    useListenerEffect(node, eventType.message, e => e.detail.logout && logout());

    let render;
    if (!url) render = <>Loading menu config...</>;
    else if (error) render = <>Error in menu: {error}</>;
    else if (loading) render = <>Loading menu app...</>;

    return (
        <div className="navbar-container">
            {render && (
                <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{justifyContent: 'center'}}>
                    <span className="navbar-text">{render}</span>
                </nav>
            )}
            <Component tracking="full" minHeight="10" origin={appRegistry[id].origin} />
        </div>
    );
});
