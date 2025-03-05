import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { checkReactDuplicates } from './utils/reactVersionCheck'

// Check for duplicate React instances in development
if (process.env.NODE_ENV !== 'production') {
  checkReactDuplicates();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
