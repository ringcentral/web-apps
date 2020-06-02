import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter';
import '@webcomponents/webcomponentsjs';
import React from 'react';
import {render} from 'react-dom';
import Router from './Router';

import 'bootstrap/dist/css/bootstrap.css';
import '@ringcentral/web-apps-host-css/styles.css';
import './index.css';

const rootEl = document.getElementById('app');

render(<Router />, rootEl);

if (module.hot) module.hot.accept();
