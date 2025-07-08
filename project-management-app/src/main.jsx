import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TaskProvider } from './context/TaskContext'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <TaskProvider>
        <App />
      </TaskProvider>
    </BrowserRouter>
  // </StrictMode>,
)
