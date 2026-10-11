import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Calculadoras from './pages/Calculadoras'
import SemaglutidaCalcPage from './pages/SemaglutidaCalcPage'
import ImcCalcPage from './pages/ImcCalcPage'
import ZonasFreqCalcPage from './pages/ZonasFreqCalcPage'
import TmbCalcPage from './pages/TmbCalcPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculadoras" element={<Calculadoras />} />
          <Route path="/calculadoras/semaglutida" element={<SemaglutidaCalcPage />} />
          <Route path="/calculadoras/imc" element={<ImcCalcPage />} />
          <Route path="/calculadoras/zonas-fc" element={<ZonasFreqCalcPage />} />
          <Route path="/calculadoras/tmb" element={<TmbCalcPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
