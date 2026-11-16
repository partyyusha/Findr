import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// global css has to load before App so page css can override it
import './styles/index.css'
import App from './App'
import AuthProvider from './context/AuthProvider'

// The starting point of the app: React takes over the <div id="root"> in index.html.
// BrowserRouter lets us change pages without reloading the browser.
// AuthProvider makes the logged in user available on every page.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
