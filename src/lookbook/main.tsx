import React from "react";
import ReactDOM from "react-dom/client";
import { LookBook } from "./LookBook";
import "../styles/global.css";
import "./lookbook.css";
import "../styles/off-duty-cast.css";

ReactDOM.createRoot(document.getElementById("lookbook-root") as HTMLElement).render(
  <React.StrictMode>
    <LookBook />
  </React.StrictMode>
);
