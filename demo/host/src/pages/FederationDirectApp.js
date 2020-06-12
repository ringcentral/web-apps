import React, {memo, useEffect, useState} from 'react';
import {appRegistry} from '../lib/registry';
import {useApplication, useListenerEffect, eventType} from '@ringcentral/web-apps-host-react';

const id = 'federationDirect';

export const FederationDirectApp = memo(({logout}) => {
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
        options: appRegistry[id].options,
    });

    useListenerEffect(node, eventType.message, e => e.detail.logout && logout());

    let render;
    if (!url) render = <>Loading federation app...</>;
    else if (error) render = <>Error in federation: {error.toString()}</>;
    else if (loading) render = <>Loading federation app...</>;

    return (
        <div className="navbar-container">
            {render && (
                <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{justifyContent: 'center'}}>
                    <span className="navbar-text">{render}</span>
                </nav>
            )}
            <Component direct mode="Direct" />
        </div>
    );
});
