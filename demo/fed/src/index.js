import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

export default node => {
    ReactDOM.render(<App foo={node.getAttribute('foo')} />, node);
    return () => ReactDOM.unmountComponentAtNode(node);
};
