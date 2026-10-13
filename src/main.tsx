// Primeiro de tudo: os dados grandes passam a ser guardados comprimidos (como na Avaliação ECL).
import './armazenamento'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
