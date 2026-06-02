import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabase } from './lib/supabase.js'

// Teste de conexão Supabase
supabase.from('_supabase_test').select('*').limit(1).then(({ error }) => {
  if (error?.code === '42P01' || error?.code === 'PGRST200') {
    console.log('✅ Supabase conectado com sucesso!')
  } else if (error) {
    console.error('❌ Erro Supabase:', error.message)
  } else {
    console.log('✅ Supabase conectado com sucesso!')
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
