import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { getStoredTheme, setTheme } from "./lib/theme";

import "./index.css";

const theme = getStoredTheme();
setTheme(theme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);