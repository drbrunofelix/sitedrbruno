// Gera o blog em HTML estático (sem depender de JavaScript) depois do `vite build`.
//
// Lê content/blog/*.md e escreve em dist/:
//   blog/index.html, blog/pagina/N/index.html, blog/<slug>/index.html, blog/tag/<tag>/index.html,
//   sitemap.xml, robots.txt, llms.txt, rss.xml, 404.html
// e injeta o JSON-LD (Physician) no <head> de dist/index.html (home), sem mudar nada visível.
//
// Regra de publicação: o artigo entra só se `draft: false` E `date <= hoje` (America/Sao_Paulo).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { Marked } from 'marked'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = path.join(ROOT, 'content', 'blog')
const DIST = path.join(ROOT, 'dist')

const SITE = 'https://www.drbrunofelix.com.br'
const SITE_NAME = 'Dr. Bruno Felix | Saúde & Performance'
const WHATSAPP = '5548988313457' // WhatsApp comercial atual (trocar aqui quando mudar)
const GA_ID = 'G-4FDQKBH46P'
const PER_PAGE = 12
const DEFAULT_IMAGE = '/photo.jpg'
const TZ = 'America/Sao_Paulo'

// ---------------------------------------------------------------- utilidades

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const abs = (p) => (/^https?:\/\//.test(p) ? p : SITE + p)

const slugify = (s) =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const todaySP = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())

const toYMD = (v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10) // YAML sem aspas vira Date (UTC)
  return v == null ? '' : String(v).trim()
}

const fmtDate = (ymd) =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${ymd}T12:00:00Z`),
  )

const isoBR = (ymd) => `${ymd}T06:00:00-03:00`
const rfc822 = (ymd) => new Date(isoBR(ymd)).toUTCString()

const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`

const write = (rel, content) => {
  const file = path.join(DIST, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

// ---------------------------------------------------------------- markdown

const headingIds = new Map()
const marked = new Marked({
  gfm: true,
  renderer: {
    // O H1 da página é o título do artigo: qualquer "# " no corpo vira H2.
    heading({ tokens, depth }) {
      const level = Math.max(2, depth)
      const html = this.parser.parseInline(tokens)
      let id = slugify(html.replace(/<[^>]+>/g, '')) || 'secao'
      const n = headingIds.get(id) || 0
      headingIds.set(id, n + 1)
      if (n) id += `-${n + 1}`
      return `<h${level} id="${id}">${html}</h${level}>\n`
    },
    image({ href, title, text }) {
      return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens)
      const external = /^https?:\/\//.test(href) && !href.startsWith(SITE)
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
    },
  },
})

const renderMarkdown = (md) => {
  headingIds.clear()
  return marked.parse(md)
}

// ---------------------------------------------------------------- leitura dos artigos

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return { published: [], all: [] }
  const errors = []
  const warnings = []
  const all = []
  const slugs = new Set()
  const today = todaySP()

  for (const file of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
    let parsed
    try {
      parsed = matter(raw)
    } catch (e) {
      errors.push(`${file}: frontmatter inválido (${e.message})`)
      continue
    }
    const d = parsed.data
    const post = {
      file,
      title: String(d.title || '').trim(),
      description: String(d.description || '').trim(),
      slug: String(d.slug || '').trim(),
      date: toYMD(d.date),
      updated: toYMD(d.updated) || toYMD(d.date),
      author: String(d.author || 'Dr. Bruno Felix').trim(),
      tags: Array.isArray(d.tags) ? d.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      cover: d.cover ? String(d.cover).trim() : '',
      cover_alt: d.cover_alt ? String(d.cover_alt).trim() : '',
      draft: d.draft === true || d.draft === 'true',
      faq: Array.isArray(d.faq) ? d.faq.filter((f) => f && f.q && f.a).map((f) => ({ q: String(f.q), a: String(f.a) })) : [],
      body: parsed.content,
    }

    const where = `content/blog/${file}`
    if (!post.title) errors.push(`${where}: falta "title"`)
    if (!post.description) errors.push(`${where}: falta "description"`)
    if (!post.slug) errors.push(`${where}: falta "slug"`)
    else if (post.slug !== slugify(post.slug)) errors.push(`${where}: slug "${post.slug}" deve ter só letras minúsculas, números e hífens`)
    else if (`${post.slug}.md` !== file) errors.push(`${where}: o nome do arquivo deve ser "${post.slug}.md"`)
    if (slugs.has(post.slug)) errors.push(`${where}: slug duplicado "${post.slug}"`)
    slugs.add(post.slug)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || isNaN(new Date(post.date))) errors.push(`${where}: "date" deve ser AAAA-MM-DD`)
    if (post.updated && !/^\d{4}-\d{2}-\d{2}$/.test(post.updated)) errors.push(`${where}: "updated" deve ser AAAA-MM-DD`)
    if (post.title.length > 70) warnings.push(`${where}: title com ${post.title.length} caracteres (ideal até ~60)`)
    if (post.description && (post.description.length < 120 || post.description.length > 170))
      warnings.push(`${where}: description com ${post.description.length} caracteres (ideal 140–160)`)
    if (/^#\s/m.test(post.body)) warnings.push(`${where}: o corpo tem "# " (H1); foi convertido em H2`)

    post.published = !post.draft && post.date && post.date <= today
    if (post.updated < post.date) post.updated = post.date
    all.push(post)
  }

  for (const w of warnings) console.warn(`[blog] aviso: ${w}`)
  if (errors.length) {
    console.error('[blog] Erros nos artigos (o build foi interrompido para não publicar nada quebrado):')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  const published = all
    .filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'pt-BR'))
  for (const p of published) {
    p.url = `/blog/${p.slug}`
    p.html = renderMarkdown(p.body)
    p.words = p.body.replace(/<[^>]+>|[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length
    p.minutes = Math.max(1, Math.round(p.words / 200))
    p.tagObjs = p.tags.map((t) => ({ name: t, slug: slugify(t) }))
  }
  return { published, all, today }
}

// ---------------------------------------------------------------- JSON-LD

const PHYSICIAN = {
  '@type': 'Physician',
  '@id': `${SITE}/#physician`,
  name: 'Dr. Bruno Felix',
  description:
    'Médico (CRM/SC 33920), pós-graduação em Medicina Esportiva. Emagrecimento, mudança de estilo de vida, atletas amadores e performance, longevidade e check-up, lesões musculoesqueléticas sem cirurgia.',
  url: `${SITE}/`,
  image: abs('/photo.jpg'),
  logo: abs('/logo-symbol.png'),
  telephone: '+55-48-98831-3457',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Jair Hamms, 38, Ed. Atrium, Sala 613B, Pedra Branca',
    addressLocality: 'Palhoça',
    addressRegion: 'SC',
    addressCountry: 'BR',
  },
  areaServed: [
    { '@type': 'City', name: 'Florianópolis' },
    { '@type': 'City', name: 'Palhoça' },
    { '@type': 'City', name: 'São José' },
    { '@type': 'Country', name: 'Brasil' },
  ],
  sameAs: ['https://www.instagram.com/drbruno.felix'],
}

const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE}/#bruno-felix`,
  name: 'Bruno Felix',
  honorificPrefix: 'Dr.',
  jobTitle: 'Médico',
  url: `${SITE}/`,
  worksFor: { '@id': `${SITE}/#physician` },
}

// ---------------------------------------------------------------- layout

const CSS = fs.readFileSync(path.join(ROOT, 'scripts', 'blog.css'), 'utf8')

function layout({ title, description, canonical, image, type = 'website', ld = [], body, extraHead = '', robots = 'index, follow' }) {
  const img = abs(image || DEFAULT_IMAGE)
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}, max-image-preview:large">
${canonical ? `<link rel="canonical" href="${esc(abs(canonical))}">` : ''}
<link rel="alternate" type="application/rss+xml" title="${esc(SITE_NAME)}" href="${SITE}/rss.xml">
<link rel="icon" type="image/png" href="/logo-symbol.png">
<meta name="theme-color" content="#157875">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(abs(canonical))}">` : ''}
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(img)}">
${extraHead}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
${ld.map(jsonLd).join('\n')}
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>
</head>
<body>
${header()}
<main id="conteudo">
${body}
</main>
${footer()}
<script>document.querySelector('.bnav__toggle').addEventListener('click',function(){var o=document.querySelector('.bnav__links').classList.toggle('is-open');this.setAttribute('aria-expanded',o)})</script>
</body>
</html>
`
}

const header = () => `<header class="bnav">
  <div class="bcontainer bnav__inner">
    <a class="bnav__brand" href="/"><img src="/logo-symbol-nav.png" alt="Dr. Bruno Felix" width="176" height="120"></a>
    <button class="bnav__toggle" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="bnav__links" aria-label="Principal">
      <a href="/#sobre">Sobre</a>
      <a href="/#especialidades">Serviços</a>
      <a href="/#contato">Contato</a>
      <a href="/blog" aria-current="page">Blog</a>
      <a href="/calculadoras">Calculadoras</a>
      <a class="bnav__cta" href="/#contato">Agendar Consulta</a>
    </nav>
  </div>
</header>`

const footer = () => `<footer class="bfooter">
  <div class="bcontainer bfooter__inner">
    <a href="/"><img src="/logo-light.png" alt="Dr. Bruno Felix — Saúde &amp; Performance" class="bfooter__logo" width="412" height="168" loading="lazy"></a>
    <nav class="bfooter__links" aria-label="Rodapé">
      <a href="/">Início</a><a href="/blog">Blog</a><a href="/calculadoras">Calculadoras</a><a href="/#contato">Contato</a>
    </nav>
    <p class="bfooter__copy">© ${new Date().getFullYear()} Dr. Bruno Felix · Florianópolis/SC · Todos os direitos reservados</p>
  </div>
</footer>`

const tagChips = (p) =>
  p.tagObjs.map((t) => `<a class="btag" href="/blog/tag/${t.slug}">${esc(t.name)}</a>`).join('')

const card = (p) => `<article class="bcard">
  <a class="bcard__media" href="${p.url}" tabindex="-1" aria-hidden="true">${
    p.cover
      ? `<img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">`
      : `<span class="bcard__placeholder">Saúde &amp; Performance</span>`
  }</a>
  <div class="bcard__body">
    <div class="btags">${tagChips(p)}</div>
    <h2 class="bcard__title"><a href="${p.url}">${esc(p.title)}</a></h2>
    <p class="bcard__desc">${esc(p.description)}</p>
    <p class="bmeta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} min de leitura</p>
  </div>
</article>`

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(url) })),
})

const breadcrumbHtml = (items) =>
  `<nav class="bcrumbs" aria-label="Você está em"><ol>${items
    .map(([name, url], i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${url}">${esc(name)}</a></li>`,
    )
    .join('')}</ol></nav>`

// ---------------------------------------------------------------- páginas

function listPage({ posts, page, pages, basePath, h1, lead, title, description, crumbs, extraLd = [] }) {
  const url = page === 1 ? basePath : `${basePath}/pagina/${page}`
  const pageUrl = (n) => (n === 1 ? basePath : `${basePath}/pagina/${n}`)
  const pager =
    pages > 1
      ? `<nav class="bpager" aria-label="Paginação">${
          page > 1 ? `<a rel="prev" href="${pageUrl(page - 1)}">← Mais recentes</a>` : '<span></span>'
        }<span>Página ${page} de ${pages}</span>${
          page < pages ? `<a rel="next" href="${pageUrl(page + 1)}">Mais antigos →</a>` : '<span></span>'
        }</nav>`
      : ''
  const fullTitle = page > 1 ? `${title} – página ${page}` : title
  return layout({
    title: fullTitle,
    description,
    canonical: url,
    ld: [{ '@context': 'https://schema.org', '@graph': [PHYSICIAN, breadcrumbLd(crumbs), ...extraLd] }],
    extraHead: [
      page > 1 ? `<link rel="prev" href="${abs(pageUrl(page - 1))}">` : '',
      page < pages ? `<link rel="next" href="${abs(pageUrl(page + 1))}">` : '',
    ].join(''),
    body: `<section class="bhero">
  <div class="bcontainer">
    ${breadcrumbHtml(crumbs)}
    <p class="blabel">Saúde &amp; Performance</p>
    <h1 class="btitle">${esc(h1)}</h1>
    <p class="blead">${esc(lead)}</p>
  </div>
</section>
<section class="bcontainer blist">
  ${posts.length ? `<div class="bgrid">${posts.map(card).join('\n')}</div>` : '<p class="bempty">Em breve, novos artigos por aqui.</p>'}
  ${pager}
</section>`,
  })
}

function articlePage(p, related) {
  const crumbs = [
    ['Início', '/'],
    ['Blog', '/blog'],
    [p.title, p.url],
  ]
  const image = p.cover || DEFAULT_IMAGE
  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': `${abs(p.url)}#artigo`,
      headline: p.title,
      description: p.description,
      datePublished: isoBR(p.date),
      dateModified: isoBR(p.updated),
      author: AUTHOR,
      publisher: { '@id': `${SITE}/#physician` },
      image: [abs(image)],
      mainEntityOfPage: { '@type': 'WebPage', '@id': abs(p.url) },
      inLanguage: 'pt-BR',
      wordCount: p.words,
      keywords: p.tags.join(', '),
      isAccessibleForFree: true,
    },
    PHYSICIAN,
    breadcrumbLd(crumbs),
  ]
  if (p.faq.length)
    graph.push({
      '@type': 'FAQPage',
      '@id': `${abs(p.url)}#faq`,
      mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })

  const updatedLine =
    p.updated && p.updated !== p.date ? ` · Atualizado em <time datetime="${p.updated}">${fmtDate(p.updated)}</time>` : ''
  const cta = waLink(`Olá, Dr. Bruno! Li o artigo "${p.title}" e gostaria de agendar uma consulta.`)

  return layout({
    title: p.title,
    description: p.description,
    canonical: p.url,
    image,
    type: 'article',
    extraHead: [
      `<meta property="article:published_time" content="${isoBR(p.date)}">`,
      `<meta property="article:modified_time" content="${isoBR(p.updated)}">`,
      `<meta property="article:author" content="Dr. Bruno Felix">`,
      ...p.tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`),
      p.cover_alt ? `<meta property="og:image:alt" content="${esc(p.cover_alt)}">` : '',
    ].join('\n'),
    ld: [{ '@context': 'https://schema.org', '@graph': graph }],
    body: `<article class="barticle">
  <header class="barticle__head bcontainer bcontainer--narrow">
    ${breadcrumbHtml(crumbs)}
    <div class="btags">${tagChips(p)}</div>
    <h1 class="btitle">${esc(p.title)}</h1>
    <p class="blead">${esc(p.description)}</p>
    <p class="bmeta">Por <strong>${esc(p.author)}</strong> · Publicado em <time datetime="${p.date}">${fmtDate(p.date)}</time>${updatedLine} · ${p.minutes} min de leitura</p>
  </header>
  ${
    p.cover
      ? `<figure class="barticle__cover bcontainer"><img src="${esc(p.cover)}" alt="${esc(p.cover_alt || p.title)}" fetchpriority="high"></figure>`
      : ''
  }
  <div class="bprose bcontainer bcontainer--narrow">
${p.html}
  </div>
  <div class="bcontainer bcontainer--narrow">
    <aside class="bcta">
      <p class="bcta__title">Quer uma avaliação individualizada?</p>
      <p>Atendimento presencial em Pedra Branca (Palhoça/SC) e online para todo o Brasil.</p>
      <a class="bbtn" href="${esc(cta)}" target="_blank" rel="noopener">Agendar consulta</a>
    </aside>
    ${
      p.faq.length
        ? `<section class="bfaq" aria-labelledby="perguntas-frequentes">
      <h2 id="perguntas-frequentes">Perguntas frequentes</h2>
      ${p.faq.map((f) => `<div class="bfaq__item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n      ')}
    </section>`
        : ''
    }
    <aside class="bauthor" aria-label="Sobre o autor">
      <img src="/logo-symbol.png" alt="" width="64" height="64" loading="lazy">
      <div>
        <p><strong>Dr. Bruno Felix</strong> | CRM/SC 33920</p>
        <p>Pós-graduação em Medicina Esportiva. NÃO ESPECIALISTA.</p>
        <p>Atendimento presencial em Pedra Branca (Palhoça/SC) e online para todo o Brasil.</p>
      </div>
    </aside>
    <p class="bdisclaimer">Conteúdo informativo. Não substitui consulta médica.</p>
  </div>
  ${
    related.length
      ? `<section class="bcontainer brelated" aria-labelledby="continue-lendo"><h2 id="continue-lendo" class="bsection-title">Continue lendo</h2><div class="bgrid">${related
          .map((r) => card(r).replace('<h2 class="bcard__title">', '<h3 class="bcard__title">').replace('</a></h2>', '</a></h3>'))
          .join('\n')}</div></section>`
      : ''
  }
</article>`,
  })
}

function notFoundPage() {
  return layout({
    title: 'Página não encontrada | Dr. Bruno Felix',
    description: 'A página que você procurou não existe ou mudou de endereço.',
    canonical: '',
    robots: 'noindex, follow',
    body: `<section class="bhero"><div class="bcontainer">
  <p class="blabel">Erro 404</p>
  <h1 class="btitle">Página não encontrada</h1>
  <p class="blead">O endereço pode ter mudado. Veja os artigos do blog ou volte para o início.</p>
  <p class="bactions"><a class="bbtn" href="/blog">Ver o blog</a> <a class="bbtn bbtn--ghost" href="/">Ir para o início</a></p>
</div></section>`,
  })
}

// ---------------------------------------------------------------- arquivos para buscadores e IAs

const STATIC_PAGES = ['/', '/calculadoras', '/calculadoras/semaglutida', '/calculadoras/imc', '/calculadoras/zonas-fc', '/calculadoras/tmb']

function sitemap(posts, tags, listPages) {
  const urls = [
    ...STATIC_PAGES.map((u) => ({ loc: u })),
    { loc: '/blog', lastmod: posts[0]?.updated },
    ...Array.from({ length: listPages - 1 }, (_, i) => ({ loc: `/blog/pagina/${i + 2}` })),
    ...posts.map((p) => ({ loc: p.url, lastmod: p.updated })),
    ...tags.map((t) => ({ loc: `/blog/tag/${t.slug}`, lastmod: t.posts[0].updated })),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${esc(abs(u.loc === '/' ? '/' : u.loc))}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`
}

const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended']

const robots = () => `# Dr. Bruno Felix | Saúde & Performance
User-agent: *
Allow: /

${AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE}/sitemap.xml
`

const llms = (posts) => `# Dr. Bruno Felix | Saúde & Performance

> Médico (CRM/SC 33920), pós-graduação em Medicina Esportiva (NÃO ESPECIALISTA). Emagrecimento, mudança de estilo de vida, atletas amadores e performance, longevidade e check-up, lesões musculoesqueléticas sem cirurgia. Presencial em Pedra Branca, Palhoça/SC, e online para todo o Brasil.

## Atendimento
- [Como funciona o acompanhamento](${SITE}/#especialidades): consulta de 1h, retorno online, grupo de 60 dias e app de acompanhamento
- [Agendar consulta](${SITE}/#contato): pelo WhatsApp; presencial na Rua Jair Hamms, 38, Ed. Atrium, Sala 613B, Pedra Branca, Palhoça/SC, ou online
- [Calculadoras](${SITE}/calculadoras): IMC, taxa metabólica basal, zonas de frequência cardíaca e semaglutida

## Artigos
${posts.map((p) => `- [${p.title}](${SITE}${p.url}): ${p.description}`).join('\n') || '- Em breve.'}
`

const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

const rss = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${esc(SITE_NAME)}</title>
  <link>${SITE}/blog</link>
  <description>Artigos do Dr. Bruno Felix sobre saúde, emagrecimento, performance, longevidade e lesões musculoesqueléticas.</description>
  <language>pt-br</language>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
  ${posts[0] ? `<lastBuildDate>${rfc822(posts[0].updated)}</lastBuildDate>` : ''}
${posts
  .slice(0, 50)
  .map(
    (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}${p.url}</link>
    <guid isPermaLink="true">${SITE}${p.url}</guid>
    <pubDate>${rfc822(p.date)}</pubDate>
    <dc:creator>${esc(p.author)}</dc:creator>
    ${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
    <description>${esc(p.description)}</description>
    <content:encoded>${cdata(p.html)}</content:encoded>
  </item>`,
  )
  .join('\n')}
</channel>
</rss>
`

// ---------------------------------------------------------------- main

function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[blog] dist/index.html não existe. Rode `vite build` antes.')
    process.exit(1)
  }
  const { published, all, today } = loadPosts()

  // /blog e paginação
  const pages = Math.max(1, Math.ceil(published.length / PER_PAGE))
  const blogLd = {
    '@type': 'Blog',
    '@id': `${SITE}/blog#blog`,
    name: 'Blog Saúde & Performance',
    url: `${SITE}/blog`,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${SITE}/#physician` },
    blogPost: published.slice(0, PER_PAGE).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(p.url), datePublished: isoBR(p.date) })),
  }
  for (let page = 1; page <= pages; page++) {
    const html = listPage({
      posts: published.slice((page - 1) * PER_PAGE, page * PER_PAGE),
      page,
      pages,
      basePath: '/blog',
      h1: 'Blog Saúde & Performance',
      lead: 'Artigos do Dr. Bruno Felix sobre emagrecimento, estilo de vida, performance esportiva, longevidade e lesões musculoesqueléticas.',
      title: 'Blog | Dr. Bruno Felix – Saúde & Performance',
      description:
        'Artigos do Dr. Bruno Felix sobre emagrecimento, mudança de estilo de vida, performance para atletas amadores, longevidade e lesões sem cirurgia.',
      crumbs: [
        ['Início', '/'],
        ['Blog', '/blog'],
      ],
      extraLd: page === 1 ? [blogLd] : [],
    })
    write(page === 1 ? 'blog/index.html' : `blog/pagina/${page}/index.html`, html)
  }

  // artigos
  for (const p of published) {
    const others = published.filter((o) => o !== p)
    const related = [
      ...others.filter((o) => o.tagObjs.some((t) => p.tagObjs.some((pt) => pt.slug === t.slug))),
      ...others,
    ].filter((o, i, arr) => arr.indexOf(o) === i).slice(0, 3)
    write(`blog/${p.slug}/index.html`, articlePage(p, related))
  }

  // tags
  const tagMap = new Map()
  for (const p of published)
    for (const t of p.tagObjs) {
      if (!tagMap.has(t.slug)) tagMap.set(t.slug, { ...t, posts: [] })
      tagMap.get(t.slug).posts.push(p)
    }
  const tags = [...tagMap.values()]
  for (const t of tags) {
    const tPages = Math.ceil(t.posts.length / PER_PAGE)
    for (let page = 1; page <= tPages; page++) {
      const base = `/blog/tag/${t.slug}`
      write(
        `${base.slice(1)}${page === 1 ? '' : `/pagina/${page}`}/index.html`,
        listPage({
          posts: t.posts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
          page,
          pages: tPages,
          basePath: base,
          h1: `Artigos sobre ${t.name}`,
          lead: `Todos os artigos do Dr. Bruno Felix sobre ${t.name.toLowerCase()}.`,
          title: `${t.name} | Blog Dr. Bruno Felix`,
          description: `Artigos do Dr. Bruno Felix sobre ${t.name.toLowerCase()}: orientações práticas de saúde e performance, com atendimento presencial e online.`,
          crumbs: [
            ['Início', '/'],
            ['Blog', '/blog'],
            [t.name, base],
          ],
        }),
      )
    }
  }

  write('sitemap.xml', sitemap(published, tags, pages))
  write('robots.txt', robots())
  write('llms.txt', llms(published))
  write('rss.xml', rss(published))
  write('404.html', notFoundPage())

  // Home: só acrescenta dados estruturados e o link do RSS no <head> (nada visível muda).
  const homeFile = path.join(DIST, 'index.html')
  let home = fs.readFileSync(homeFile, 'utf8')
  if (!home.includes('"@type":"Physician"')) {
    const inject = `${jsonLd({ '@context': 'https://schema.org', ...PHYSICIAN })}\n    <link rel="alternate" type="application/rss+xml" title="${esc(SITE_NAME)}" href="${SITE}/rss.xml">\n  </head>`
    home = home.replace('</head>', inject)
    fs.writeFileSync(homeFile, home)
  }

  const scheduled = all.filter((p) => !p.draft && !p.published)
  const drafts = all.filter((p) => p.draft)
  console.log(
    `[blog] ${published.length} publicado(s), ${scheduled.length} agendado(s), ${drafts.length} rascunho(s) · hoje (Brasília): ${today}`,
  )
  for (const p of scheduled) console.log(`[blog]   agendado: ${p.slug} (${p.date})`)
}

main()
