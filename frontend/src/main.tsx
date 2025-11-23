import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/router";
import { GlobalStyle } from "./styles";  

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyle />
    <AppRouter />
  </React.StrictMode>
);
