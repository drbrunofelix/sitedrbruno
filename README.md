# Site Dr. Bruno Felix | Saúde & Performance

Site em React + Vite, hospedado na Vercel (www.drbrunofelix.com.br).
O blog é gerado em **HTML estático** no build, para o Google e as IAs lerem sem JavaScript.

## Publicar um artigo

**Para publicar, adicione `content/blog/<slug>.md`** e faça o deploy (push no GitHub).

```yaml
---
title: "Dor no joelho ao correr: causas e quando tratar sem cirurgia"   # até ~60 caracteres
description: "Resumo de 140 a 160 caracteres."
slug: "dor-no-joelho-ao-correr"        # igual ao nome do arquivo, sem acentos
date: "2026-12-03"                     # data de publicação (AAAA-MM-DD)
updated: "2026-12-03"                  # opcional
author: "Dr. Bruno Felix"
tags: ["lesões", "corrida", "joelho"]
cover: "/blog/capas/dor-no-joelho-ao-correr.jpg"   # opcional (arquivo em public/blog/capas/)
cover_alt: "Corredor segurando o joelho"           # opcional
draft: false
faq:
  - q: "Pergunta?"
    a: "Resposta."
---
Corpo em Markdown, com subtítulos ## e ###.
```

- O artigo só aparece se `draft: false` **e** `date` for hoje ou antes (fuso de Brasília).
- Artigos com data futura ficam **agendados**: o site é republicado todo dia às 06:00 e eles entram no ar sozinhos.
- Imagens: coloque em `public/blog/capas/` (capa) ou `public/blog/imagens/<slug>/` e use o caminho começando por `/blog/...`.
- Se um arquivo tiver erro (sem título, slug diferente do nome do arquivo, data inválida), o build para e a Vercel mantém a versão anterior no ar.

A caixa do autor, as "Perguntas frequentes", o aviso "Conteúdo informativo…", o botão "Agendar consulta" e os dados estruturados (JSON-LD) entram automaticamente.

## O que o build gera

`npm run build` roda o `vite build` e depois o `scripts/build-blog.mjs`, que escreve em `dist/`:

| Endereço | Conteúdo |
|---|---|
| `/blog`, `/blog/pagina/N` | Lista de artigos (12 por página) |
| `/blog/<slug>` | Artigo (BlogPosting + FAQPage + BreadcrumbList) |
| `/blog/tag/<tag>` | Artigos por tag |
| `/sitemap.xml` | Todas as páginas e artigos, com `lastmod` |
| `/robots.txt` | Libera tudo, inclusive robôs de IA, e aponta para o sitemap |
| `/llms.txt` | Resumo do site para IAs, gerado a partir dos artigos |
| `/rss.xml` | Feed dos artigos |
| `/404.html` | Página de erro |

Também acrescenta o JSON-LD `Physician` no `<head>` da home (sem mudar nada visível).
Configurações (WhatsApp, Google Analytics, endereço) ficam no topo de `scripts/build-blog.mjs`; o visual em `scripts/blog.css`.

Para testar localmente: `npm run build` e depois `cd dist && python3 -m http.server 4174`. Abra http://localhost:4174/blog/ com a barra no fim; a Vercel não precisa dela.

## Rebuild diário (artigos agendados)

O GitHub Actions (`.github/workflows/rebuild-diario.yml`) chama um Deploy Hook da Vercel todo dia às 06:00 (Brasília). Configuração, uma vez só:

1. Vercel → projeto do site → **Settings → Git → Deploy Hooks** → nome `rebuild-diario`, branch `main` → **Create Hook** e copie a URL.
2. GitHub → repositório `sitedrbruno` → **Settings → Secrets and variables → Actions → New repository secret** → nome `VERCEL_DEPLOY_HOOK`, valor = a URL copiada.
3. Para testar: GitHub → **Actions → Rebuild diário do blog → Run workflow**.

## Blog antigo (blog.drbrunofelix.com.br)

Os 4 artigos do ClickHunt foram migrados para `content/blog/`, com as imagens em `public/blog/`.
O `vercel.json` já redireciona (301) `blog.drbrunofelix.com.br/blog/<slug>` para `www.drbrunofelix.com.br/blog/<slug>`. O redirecionamento só funciona depois que o subdomínio estiver neste projeto da Vercel:

1. No ClickHunt, desvincule/remova o domínio `blog.drbrunofelix.com.br` e cancele o serviço.
2. Vercel → este projeto → **Settings → Domains → Add** → `blog.drbrunofelix.com.br`. Se o DNS pedir, aponte o `CNAME` de `blog` para `cname.vercel-dns.com`.
