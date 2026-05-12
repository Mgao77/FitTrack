import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './styles/globals.css'

async function mountApp() {
  const root = ReactDOM.createRoot(document.getElementById('root')!)

  if (import.meta.env.DEV) {
    const { DevApp } = await import('./dev/index.tsx')
    root.render(
      <React.StrictMode>
        <DevApp />
      </React.StrictMode>
    )
  } else {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    )
  }
}

mountApp()
