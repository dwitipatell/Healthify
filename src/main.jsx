import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
<<<<<<< HEAD
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
    <App />
  </BrowserRouter>
)
=======

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
>>>>>>> 40970e347bdc6c6841b6f49292637f701a4e4505
