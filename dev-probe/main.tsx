// dev-only — CRUD admin scaffold bootstrap.
// NOT bundled to dist/. NOT published. Lives only at dev-probe/.

import React from "react";
import ReactDOM from "react-dom/client";
import "../src/tokens/tailwind.css";
import { initI18n } from "../src/i18n";
import App from "./crud/App";

initI18n();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
