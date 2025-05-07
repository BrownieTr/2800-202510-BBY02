import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import './styles/index.css'

// import client  from './connection.js'


function MyForm() {
  const [name, setName] = useState("");
  const a = import.meta.env.VITE_ATLAS_URI
  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`The name you entered was: ${name}`)
  }
  console.log(a);
  return(
    <form onSubmit={handleSubmit}>
      <label>
        Enter your name:
        <input type='text' value= {name} onChange= {(e) => setName(e.target.value)}/>
      </label>
      <input type='submit' />
    </form>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyForm />
  </StrictMode>
)

