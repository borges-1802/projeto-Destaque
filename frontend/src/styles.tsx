import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    min-height: 100vh;

    font-family: 'Poppins', 'Inter', ui-sans-serif, system-ui,
      -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    min-height: 100vh;
  }

  body {
    margin: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
`;