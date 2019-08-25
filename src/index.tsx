import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/App';
import * as serviceWorker from './serviceWorker';

import { initializeIcons } from '@uifabric/icons';
initializeIcons();

let provider;
//@ts-ignore
if (process.env.NODE_ENV !== 'production' && window.require === undefined) {
    const { StubProvider } =  require('./StubProvider');
    provider = new StubProvider();
} else {
    //@ts-ignore
    const { remote } = window.require('electron');
    provider = remote.getGlobal('provider');
}

ReactDOM.render(<App provider={provider} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
