import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import App from './App.jsx'

// const onRedirectCallback = (appState) => {
//   window.history.replaceState(
//     {},
//     document.title,
//     appState?.targetUrl || "/"
//   );
// };

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-d0fbndwh4b5aqcbr.us.auth0.com"
        clientId="XPQZuDWCW559syd04haEyVFVczvV9rQ3"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: "https://api.playpal.com",
          scope: "openid profile email" // Add required scopes
        }}

      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>
);