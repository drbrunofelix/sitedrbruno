import { Link } from 'react-router-dom'
import './Blog.css'

const posts = [
  {
    slug: 'exercicio-como-remedio',
    title: 'Exercício como remédio: por que se mover é a melhor medicina',
    excerpt: 'A ciência comprova: a atividade física regular é uma das intervenções mais eficazes para prevenção e tratamento de doenças crônicas.',
    date: '2 jun 2026',
    tag: 'Saúde & Ciência',
  },
]

export default function Blog() {
  return (
    <div className="blog-page">
      <div className="blog-page__header">
        <div className="container">
          <Link to="/" className="blog-page__back">← Voltar ao site</Link>
          <p className="section-label">Blog</p>
          <h1 className="blog-page__title">Artigos & Conteúdo</h1>
          <p className="blog-page__subtitle">
            Informação de qualidade sobre medicina esportiva, saúde e performance, escrita por quem vive isso no dia a dia.
          </p>
        </div>
      </div>

      <div className="container blog-page__grid">
        {posts.map((post) => (
          <article key={post.slug} className="blog-card">
            <span className="blog-card__tag">{post.tag}</span>
            <h2 className="blog-card__title">{post.title}</h2>
            <p className="blog-card__excerpt">{post.excerpt}</p>
            <div className="blog-card__footer">
              <span className="blog-card__date">{post.date}</span>
              <span className="blog-card__read">Ler artigo →</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
