import './About.css'

const credentials = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'CRM/SC 33.920',
    description: 'Registro no Conselho Regional de Medicina de Santa Catarina',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Medicina Esportiva',
    description: 'Pós-graduado em Medicina do Esporte pela Cetrus-SP',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: 'Avaí Futebol Clube',
    description: 'Médico da equipe profissional de futebol — Florianópolis/SC',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Força Aérea Brasileira',
    description: 'Oficial Médico — Base Aérea de Florianópolis (BAFL)',
  },
]

export default function About() {
  return (
    <section id="sobre" className="about section">
      <div className="container about__inner">
        <div className="about__photo-col">
          <div className="about__photo-frame">
            <img
              src="/photo-about.png"
              alt="Dr. Bruno Felix — Medicina Esportiva"
              className="about__photo-img"
            />
            <div className="about__photo-accent" />
          </div>

          <div className="about__badge">
            <div className="about__badge-dot" />
            <div>
              <p className="about__badge-value">Atendimento presencial: Florianópolis e Região</p>
              <p className="about__badge-value">Online para todo Brasil</p>
            </div>
          </div>
        </div>

        <div className="about__content">
          <p className="section-label">Quem sou eu</p>
          <p className="about__bio">
            Muito prazer, me chamo <strong>Bruno Felix Fernandes</strong>, médico formado pela Universidade do Sul de Santa Catarina — UNISUL, com especialização e experiência em <strong>Medicina Esportiva</strong>.
          </p>
          <p className="about__bio">
            Atuo como médico da equipe profissional do <strong>Avaí Futebol Clube</strong> e como Oficial Médico da <strong>Força Aérea Brasileira</strong>, na Base Aérea de Florianópolis.
          </p>
          <p className="about__bio">
            Minha prática une conhecimento clínico, embasamento científico e vivência diária no <strong>esporte de alto rendimento</strong>. Atendo <strong>atletas profissionais</strong>, <strong>atletas amadores</strong> e pessoas que desejam melhorar sua saúde, performance, composição corporal e <strong>qualidade de vida</strong> por meio de um cuidado médico individualizado.
          </p>
          <p className="about__bio">
            Acredito que o <strong>exercício é uma das ferramentas mais poderosas da medicina</strong>. Meu objetivo é oferecer uma abordagem moderna, segura e personalizada — seja na prevenção e tratamento de lesões, na avaliação pré-participação esportiva, na otimização do desempenho físico ou na construção de uma rotina mais ativa, saudável e sustentável.
          </p>

        </div>
      </div>
    </section>
  )
}
