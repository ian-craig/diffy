import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./Components/App";

import { initializeIcons } from "@uifabric/icons";
import { createReduxStore } from "./state/Store";
import { Provider } from "react-redux";
initializeIcons();

let provider;
//@ts-ignore
if (process.env.NODE_ENV !== "production" && window.require === undefined) {
  const { StubProvider } = require("./Providers/StubProvider");
  provider = new StubProvider();
} else {
  //@ts-ignore
  const { remote } = window.require("electron");
  provider = remote.getGlobal("provider");
}

const store = createReduxStore();

ReactDOM.render(
  <Provider store={store}>
    <App provider={provider} />
  </Provider>,
  document.getElementById("root"),
);
