RingCentral Web Apps React
===============================

The purpose of this library is to synchronize page `location` with `history` object of React.

The reason why it is needed is this bug of React Router: https://github.com/ReactTraining/react-router/issues/7113.

## Usage

**This library can be used without Web Apps.**

Simply put the `LocationSync` anywhere under `Router` in your hierarchy of components:

```js
import {BrowserRouter, Route} from 'react-router-dom';
import {LocationSync} from '@ringcentral/web-apps-react';

export default () => (
    <BrowserRouter>
        <LocationSync />
        <Route />
        <Route />
        <Route />
        <Route />
    </BrowserRouter>
);
```