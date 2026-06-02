import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Contact.css'

export default function Contact() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const buildWhatsappUrl = (nome) => {
    const msg = nome
      ? `Ol%C3%A1%2C%20Dr.%20Bruno%2C%20meu%20nome%20%C3%A9%20${encodeURIComponent(nome)}%20e%20gostaria%20de%20agendar%20uma%20consulta.`
      : 'Ol%C3%A1%2C%20Dr.%20Bruno%2C%20gostaria%20de%20agendar%20uma%20consulta%20em%20Medicina%20Esportiva.'
    return `https://wa.me/5548988313457?text=${msg}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await supabase.from('leads').insert({
        nome: nome.trim() || null,
        telefone: telefone.trim() || null,
        origem: 'formulario',
      })
    } catch (_) {
      // falha silenciosa — abre WhatsApp de qualquer forma
    }

    setEnviado(true)
    setLoading(false)
    window.open(buildWhatsappUrl(nome), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="contato" className="contact section">
      <div className="contact__bg-glow" aria-hidden="true" />
      <div className="container contact__inner">
        <div className="contact__text">
          <p className="section-label">Contato</p>
          <h2 className="section-title">
            Pronto para cuidar da sua saúde esportiva?
          </h2>
          <p className="section-subtitle">
            Entre em contato pelo WhatsApp para agendar sua consulta. Atendimento presencial em Florianópolis e região. Online para todo o Brasil.
          </p>

          <div className="contact__info-list">
            <div className="contact__info-item">
              <div className="contact__info-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <p className="contact__info-label">Localização</p>
                <p className="contact__info-value">Florianópolis, SC — Brasil</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="contact__info-label">Telefone / WhatsApp</p>
                <p className="contact__info-value">(48) 98831-3457</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
              <div>
                <p className="contact__info-label">Registro Profissional</p>
                <p className="contact__info-value">CRM/SC 33.920</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact__card">
          <div className="contact__card-header">
            <div className="contact__card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="contact__card-label">Agendamento</p>
              <p className="contact__card-title">Fale pelo WhatsApp</p>
            </div>
          </div>

          <p className="contact__card-desc">
            Preencha seus dados e seja direcionado ao WhatsApp. Responderei pessoalmente no menor tempo possível.
          </p>

          {enviado ? (
            <div className="contact__success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Mensagem enviada! O WhatsApp foi aberto.</p>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__field">
                <label className="contact__label" htmlFor="nome">Seu nome</label>
                <input
                  id="nome"
                  className="contact__input"
                  type="text"
                  placeholder="Como posso te chamar?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="contact__field">
                <label className="contact__label" htmlFor="telefone">Telefone / WhatsApp</label>
                <input
                  id="telefone"
                  className="contact__input"
                  type="tel"
                  placeholder="(48) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              <button
                className="contact__whatsapp-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="contact__spinner" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                )}
                {loading ? 'Aguarde...' : 'Agendar via WhatsApp'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
