import React from "react";
import ReactDOM from "react-dom/client";
import { ArtReviewBoard } from "./ArtReviewBoard";
import "./artreview.css";

ReactDOM.createRoot(document.getElementById("artreview-root") as HTMLElement).render(
  <React.StrictMode>
    <ArtReviewBoard />
  </React.StrictMode>
);
