import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline, StyledEngineProvider } from "@mui/material";
import App from "./app/App";
import theme from "./shared/theme";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error(
    "Failed to find the root element. Make sure you have a <div id='root'></div> in your index.html"
  );
}

const root = createRoot(container);

root.render(
  <StrictMode>
    {/* StyledEngineProvider with injectFirst ensures Tailwind CSS can override MUI styles */}
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>
);
