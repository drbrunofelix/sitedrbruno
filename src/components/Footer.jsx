import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img
            src="/logo-light.png"
            alt="Dr. Bruno Felix — Saúde & Performance"
            className="footer__logo"
            width="412"
            height="168"
          />
        </div>
        <nav className="footer__links" aria-label="Rodapé">
          <a href="/blog">Blog</a>
        </nav>
        <p className="footer__copy">
          © {new Date().getFullYear()} Dr. Bruno Felix · Florianópolis/SC · Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}
