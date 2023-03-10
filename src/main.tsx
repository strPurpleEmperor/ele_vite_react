import "./samples/node-api";
import "./index.scss";
import "antd/dist/reset.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import store from "@/app/store";

import App from "./App";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);

postMessage({ payload: "removeLoading" }, "*");
