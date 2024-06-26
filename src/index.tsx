import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
/*
root.render(
  <App />
);
*/