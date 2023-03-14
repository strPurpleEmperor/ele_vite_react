import "./samples/node-api";
import "./index.scss";
import "antd/dist/reset.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <HashRouter>
    <App />
  </HashRouter>
);

postMessage({ payload: "removeLoading" }, "*");
