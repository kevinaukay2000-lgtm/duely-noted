import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './styles/app.css'
import App from './App.jsx'
import AppProvider from './context/AppProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Sync location updates: the task search box is driven by URL params, and transitions would drop keystrokes. */}
    <HashRouter useTransitions={false}>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
)
