import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

export default node => {
    ReactDOM.render(<App mode={node.getAttribute('mode')} />, node);
    return () => ReactDOM.unmountComponentAtNode(node);
};
