import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
// import Header from './components/layout/Header'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Header /> */}
    <App />
  </StrictMode>,
)
