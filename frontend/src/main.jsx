import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './axiosSetup'   // ← global 401 interceptor (must be before App)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
