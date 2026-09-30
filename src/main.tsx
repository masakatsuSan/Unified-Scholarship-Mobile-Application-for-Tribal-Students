import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RouterProvider } from './context/RouterContext.tsx';
import { AuthProvider } from './auth/useAuth.tsx';
import { authService } from './auth/authService.ts';
import { seedPersonas } from './data/seedData.ts';
// Imported before the first render so i18next resolves the saved language and
// the whole tree mounts in that language instead of flashing English.
import './i18n/index.ts';

// Prepare auth before the first render so a returning user never sees a signed-out flash.
authService.initialize(seedPersonas);
authService.restoreSession();

// Inline critical styles to ensure focus-visible detection works in test environments
// and to guarantee accessibility styles are always available
const focusStyle = document.createElement('style');
focusStyle.id = 'a11y-focus-styles';
focusStyle.textContent = `
*:focus-visible { outline: 2px solid #0f665b; outline-offset: 2px; }
button:focus-visible { outline: 2px solid #0f665b; outline-offset: 2px; }
a:focus-visible { outline: 2px solid #d97706; outline-offset: 2px; }
input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid #0f665b; outline-offset: 2px; }
`;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(focusStyle);
  });
} else {
  document.head.appendChild(focusStyle);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider personas={seedPersonas}>
        <App />
      </AuthProvider>
    </RouterProvider>
  </StrictMode>,
);
