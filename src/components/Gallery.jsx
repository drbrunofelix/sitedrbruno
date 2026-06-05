import './Gallery.css'

const experiences = [
  {
    title: 'Médico de equipe — Avaí Futebol Clube',
    description: 'Atuação junto à equipe profissional, com acompanhamento clínico e esportivo de atletas de alto rendimento.',
  },
  {
    title: 'Oficial Médico — Força Aérea Brasileira',
    description: 'Atuação como médico militar na Base Aérea de Florianópolis, com cuidado integral em saúde.',
  },
  {
    title: 'Especialização em Medicina do Exercício e do Esporte — Cetrus-SP',
    description: 'Formação voltada à avaliação, prevenção e tratamento de condições relacionadas à prática esportiva, exercício físico e performance.',
  },
  {
    title: 'Ambulatório de Medicina Esportiva — Imperial Hospital de Caridade, Florianópolis',
    description: 'Atendimento especializado para diversas modalidades esportivas: atletismo, vôlei, ciclismo, natação, ginástica artística... Atendimento para atletas mirins, juvenis e amadores.',
  },
  {
    title: 'Consultório particular',
    description: 'Atendimento individualizado para pessoas que buscam melhorar qualidade de vida, composição corporal, performance física, saúde metabólica e rotina de exercícios, com acompanhamento médico seguro, moderno e personalizado.',
  },
]

const photos = [
  {
    src: '/exp-fab.jpg',
    alt: 'Dr. Bruno Felix — Oficial Médico da Força Aérea Brasileira',
    caption: 'Força Aérea Brasileira',
  },
  {
    src: '/avai_retrato.jpg',
    alt: 'Dr. Bruno Felix no Avaí Futebol Clube',
    caption: 'Avaí Futebol Clube',
  },
  {
    src: '/exp-consultorio.jpg',
    alt: 'Dr. Bruno Felix no consultório particular',
    caption: 'Consultório particular',
  },
  {
    src: '/exp-cetrus.png',
    alt: 'Certificado de Especialização — Cetrus-SP',
    caption: 'Especialização Cetrus-SP',
  },
]

export default function Gallery() {
  return (
    <section id="atuacao" className="gallery section">
      <div className="container">
        <div className="gallery__header">
          <p className="section-label">Atuação profissional</p>
          <h2 className="section-title">Experiência Profissional</h2>
        </div>

        <div className="gallery__experience">
          <div className="gallery__exp-list">
            {experiences.map((e, i) => (
              <div key={i} className="gallery__exp-item">
                <div className="gallery__exp-dot" />
                <div>
                  <p className="gallery__exp-name">{e.title}</p>
                  <p className="gallery__exp-desc">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gallery__grid">
          {photos.map((p, i) => (
            <div key={i} className="gallery__item">
              <img src={p.src} alt={p.alt} loading="lazy" />
              <div className="gallery__overlay">
                <p className="gallery__caption">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
