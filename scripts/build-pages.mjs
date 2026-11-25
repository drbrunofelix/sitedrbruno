// Dá título, descrição e link canônico próprios a páginas do app React (SPA), no HTML entregue
// pelo servidor. Roda depois do build-blog.mjs: copia dist/index.html para dist/<rota>/index.html
// trocando só o <head> e acrescentando um resumo em <noscript> para buscadores e IAs.
// A Vercel serve esse arquivo para a rota; o React carrega normalmente por cima.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://www.drbrunofelix.com.br'

const PAGES = [
  {
    route: '/calculadoras',
    title: 'Calculadoras de Saúde e Performance | Dr. Bruno Felix',
    description:
      'Calculadoras gratuitas de IMC, gasto calórico (TMB), zonas de frequência cardíaca, semaglutida, LDL-colesterol e risco cardiovascular.',
    summary:
      'Ferramentas do Dr. Bruno Felix para acompanhar saúde e performance: IMC (classificação da OMS), taxa metabólica basal e gasto calórico diário (Harris-Benedict revisada), zonas de treino Z1–Z5 por frequência cardíaca, doses e fracionamento de canetas de semaglutida, LDL-colesterol por Martin/Hopkins e risco cardiovascular em 10 anos pelo escore PREVENT. Os resultados são orientativos e não substituem consulta médica.',
  },
  {
    route: '/calculadoras/imc',
    title: 'Calculadora de IMC (Índice de Massa Corporal) | Dr. Bruno Felix',
    description:
      'Calcule seu IMC com peso e altura e veja em qual faixa você está pela classificação da OMS: baixo peso, peso adequado, sobrepeso ou obesidade.',
    summary:
      'Calculadora de IMC (Índice de Massa Corporal): IMC = peso (kg) ÷ altura² (m). Classificação para adultos segundo a OMS: abaixo de 18,5 baixo peso; 18,5 a 24,9 peso adequado; 25 a 29,9 sobrepeso; 30 ou mais obesidade.',
  },
  {
    route: '/calculadoras/tmb',
    title: 'Calculadora de Gasto Calórico e TMB | Dr. Bruno Felix',
    description:
      'Calcule a taxa metabólica basal (TMB) pela equação de Harris-Benedict revisada e estime seu gasto calórico diário total (TDEE) pelo nível de atividade.',
    summary:
      'Calculadora da taxa metabólica basal (TMB, em kcal/dia) pela equação de Harris-Benedict revisada, com estimativa do gasto energético diário total (TDEE) conforme o nível de atividade física.',
  },
  {
    route: '/calculadoras/zonas-fc',
    title: 'Zonas de Treino por Frequência Cardíaca | Dr. Bruno Felix',
    description:
      'Descubra suas zonas de treino Z1 a Z5 pela frequência cardíaca máxima, informada ou estimada pela idade, para treinar com a intensidade certa.',
    summary:
      'Calculadora de zonas de treinamento Z1 a Z5 por porcentagem da frequência cardíaca máxima (FCmáx). A FCmáx pode ser informada diretamente ou estimada pela idade por fórmula.',
  },
  {
    route: '/calculadoras/semaglutida',
    title: 'Calculadora de Semaglutida: doses e cliques | Dr. Bruno Felix',
    description:
      'Calcule doses e fracionamento das canetas de semaglutida, com o volume em mL e o número de cliques para cada dose prescrita.',
    summary:
      'Calculadora de doses e fracionamento de canetas de semaglutida: converte a dose prescrita em volume (mL) e número de cliques da caneta. Uso conforme prescrição médica.',
  },
  {
    route: '/calculadoras/ldl',
    title: 'Calculadora de LDL (Martin/Hopkins) | Dr. Bruno Felix',
    description:
      'Calcule o LDL-colesterol pela equação de Martin/Hopkins, recomendada pela Diretriz Brasileira de Dislipidemias 2025, e compare com a meta do seu risco.',
    summary:
      'Calculadora de LDL-colesterol pela equação de Martin/Hopkins (LDL = colesterol total − HDL − triglicerídeos ÷ fator, com fator de uma tabela de 180 combinações), recomendada pela Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2025. Mostra também o colesterol não-HDL e compara com as metas por categoria de risco: baixo (LDL < 115 mg/dL), intermediário (< 100), alto (< 70), muito alto (< 50) e extremo (< 40).',
  },
  {
    route: '/calculadoras/risco-cardiovascular',
    title: 'Calculadora de Risco Cardiovascular (PREVENT) | Dr. Bruno Felix',
    description:
      'Estime o risco de infarto e AVC em 10 anos pelo escore PREVENT e veja sua categoria de risco e as metas de LDL da Diretriz Brasileira de Dislipidemias 2025.',
    summary:
      'Calculadora de risco cardiovascular em 10 anos pelo escore PREVENT (American Heart Association, 2024), recomendado pela Diretriz Brasileira de Dislipidemias 2025 para adultos de 30 a 79 anos sem doença cardiovascular. Usa idade, sexo, colesterol total, HDL, pressão sistólica, uso de anti-hipertensivo e estatina, diabetes, tabagismo e taxa de filtração glomerular. Classifica em baixo (< 5%), intermediário (5% a < 20%) ou alto risco (≥ 20%), considerando fatores agravantes, e mostra as metas de LDL e não-HDL.',
  },
]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const base = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

for (const p of PAGES) {
  const url = SITE + p.route
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(p.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(p.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(p.description)}" />`)
    .replace('</head>', `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    <noscript><h1>${esc(p.title.split(' | ')[0])}</h1><p>${esc(p.summary)}</p></noscript>`)
  if (!html.includes(`<title>${esc(p.title)}</title>`) || !html.includes(p.description.slice(0, 40))) {
    console.error(`[pages] não consegui trocar o <head> de ${p.route}; confira o index.html`)
    process.exit(1)
  }
  const out = path.join(DIST, p.route.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
}
console.log(`[pages] ${PAGES.length} página(s) do app com título próprio`)
