import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const links = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#especialidades' },
    { label: 'Contato', href: '#contato' },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link className="navbar__brand" to="/">
          <img
            src="/logo-symbol-nav.png"
            alt="Dr. Bruno Felix"
            className="navbar__logo"
            width="176"
            height="120"
          />
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          {links.map((l) => (
            <button key={l.href} className="navbar__link" onClick={() => handleNav(l.href)}>
              {l.label}
            </button>
          ))}
          <a
            className="navbar__link"
            href="https://blog.drbrunofelix.com.br"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </a>
          <Link
            className="navbar__link"
            to="/calculadoras"
            onClick={() => setMenuOpen(false)}
          >
            Calculadoras
          </Link>
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
