import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Login } from './Login.jsx'
import { Homepage } from './Homepage.jsx'
import { HashRouter, Routes, Route } from 'react-router-dom'

const CLIENT_ID = "513139989236-obemhc05j988q2rrpv9ifubh5qfmcfg7.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App></App>
      
    </GoogleOAuthProvider>
  </StrictMode>,
)
