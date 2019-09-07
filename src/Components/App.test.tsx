import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { StubProvider } from "../Providers/StubProvider";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App provider={new StubProvider()} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
