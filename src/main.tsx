import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// <App> is mounted once and persists across navigations — it reads the URL via
// useLocation and renders the matching view inside its transition layers.
// (Routing the element per-path would remount App on every navigation and
// destroy the in-flight transition.) Unknown paths fall through to Home.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
