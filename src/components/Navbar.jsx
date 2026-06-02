import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#especialidades' },
    { label: 'Contato', href: '#contato' },
  ]

  const handleNav = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a className="navbar__brand" href="#hero" onClick={() => handleNav('#hero')}>
          <img
            src="/logo-symbol-nav.png"
            alt="Dr. Bruno Felix"
            className="navbar__logo"
            width="176"
            height="120"
          />
        </a>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          {links.map((l) => (
            <button key={l.href} className="navbar__link" onClick={() => handleNav(l.href)}>
              {l.label}
            </button>
          ))}
          <a
            className="navbar__cta"
            href="#contato"
            onClick={() => { setMenuOpen(false) }}
          >
            Agendar Consulta
          </a>
        </nav>

        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
