import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CartProvider } from './hooks/useCart'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
