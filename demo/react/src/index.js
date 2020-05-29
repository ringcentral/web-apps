import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {registerAppCallback} from '@ringcentral/web-apps-react';
import App from './App';

let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

console.log('Global App Registered'); // because it's loaded as single bundle both global and script app are delivered at once

registerAppCallback('global', node => {
    const onChange = () => render(<App authtoken={node.getAttribute('authtoken')} node={node} />, node);

    const observer = new MutationObserver(mutations =>
        mutations.forEach(
            mutation => mutation.type === 'attributes' && onChange(), // you may also accumulate this instead of calling every time
        ),
    );

    node.addEventListener('remove', () => {
        unmountComponentAtNode(node);
        observer.disconnect();
    });

    observer.observe(node, {attributes: true});

    onChange();

    console.log('Global App Rendered');

    return () => {
        console.log('Global App Unmounted');
    };
});
