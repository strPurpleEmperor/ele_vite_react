import "./samples/node-api";
import "./index.scss";
import "antd/dist/reset.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

postMessage({ payload: "removeLoading" }, "*");
