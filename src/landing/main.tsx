import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Landing } from './Landing'
import '../theme.css'
import './landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
