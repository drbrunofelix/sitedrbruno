import { useEffect } from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Gallery from '../components/Gallery'
import Services from '../components/Services'
import Contact from '../components/Contact'

export default function Home() {
  // Links vindos do blog (ex.: /#contato) chegam antes de a página montar; rola até a seção.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Hero />
      <About />
      <Gallery />
      <Services />
      <Contact />
    </>
  )
}
