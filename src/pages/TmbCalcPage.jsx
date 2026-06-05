import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './TmbCalcPage.css'

const ACTIVITY_LEVELS = [
  { id: 'sed',     label: 'Sedentário',           factor: 1.2,   desc: 'Pouco ou nenhum exercício' },
  { id: 'light',   label: 'Levemente ativo',       factor: 1.375, desc: 'Exercício leve 1–3x/semana' },
  { id: 'mod',     label: 'Moderado',              factor: 1.55,  desc: 'Exercício moderado 3–5x/semana' },
  { id: 'active',  label: 'Muito ativo',           factor: 1.725, desc: 'Exercício intenso 6–7x/semana' },
  { id: 'vactive', label: 'Extremamente ativo',    factor: 1.9,   desc: 'Exercício muito intenso ou trabalho físico' },
]

function calcTmb(sexo, peso, altura, idade) {
  if (sexo === 'M') return 88.362 + 13.397 * peso + 4.799 * altura - 5.677 * idade
  return 447.593 + 9.247 * peso + 3.098 * altura - 4.330 * idade
}

export default function TmbCalcPage() {
  const [sexo,      setSexo]      = useState('M')
  const [pesoInput, setPesoInput] = useState('')
  const [altInput,  setAltInput]  = useState('')
  const [idadeInput,setIdadeInput]= useState('')
  const [activity,  setActivity]  = useState('mod')
  const [copied,    setCopied]    = useState(false)

  const result = useMemo(() => {
    const p  = parseFloat(pesoInput.replace(',', '.'))
    const h  = parseFloat(altInput.replace(',', '.'))
    const ag = parseFloat(idadeInput.replace(',', '.'))
    if (isNaN(p) || isNaN(h) || isNaN(ag) || p <= 0 || h <= 0 || ag <= 0) return null
    const tmb  = calcTmb(sexo, p, h, ag)
    const act  = ACTIVITY_LEVELS.find(a => a.id === activity)
    const tdee = tmb * act.factor
    return { tmb: Math.round(tmb), tdee: Math.round(tdee), factor: act.factor, actLabel: act.label }
  }, [sexo, pesoInput, altInput, idadeInput, activity])

  const WA = 'https://wa.me/5548988313457?text=Ol%C3%A1%2C%20Dr.%20Bruno%21%20Gostaria%20de%20agendar%20uma%20consulta%20para%20acompanhamento%20nutricional%20e%20de%20composicao%20corporal.'

  const handleCopy = () => {
    if (!result) return
    const lines = [
      'Calculadora TMB — Dr. Bruno Felix',
      `Sexo: ${sexo === 'M' ? 'Masculino' : 'Feminino'}`,
      `Idade: ${idadeInput} anos · Peso: ${pesoInput} kg · Altura: ${altInput} cm`,
      `Nível de atividade: ${result.actLabel} (${result.factor})`,
      `TMB: ${result.tmb.toLocaleString('pt-BR')} kcal/dia`,
      `TDEE: ${result.tdee.toLocaleString('pt-BR')} kcal/dia`,
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tmb-page">
      <div className="tmb-page__header">
        <div className="container">
          <div className="tmb-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>TMB / Gasto Calórico</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="tmb-page__title">Harris-Benedict — Taxa Metabólica Basal (TMB)</h1>
          <p className="tmb-page__subtitle">
            Calcula a TMB (kcal/dia) pela equação de Harris-Benedict revisada e estima o gasto diário total (TDEE) com base no nível de atividade.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tmb-layout">

          {/* ── Calculator ── */}
          <div className="tmb-calc">

            {/* Sexo */}
            <div className="tmb-calc__group">
              <span className="tmb-calc__group-label">Sexo</span>
              <div className="tmb-toggle">
                {[['M','Masculino'],['F','Feminino']].map(([v,l]) => (
                  <button
                    key={v}
                    className={`tmb-toggle__btn${sexo === v ? ' tmb-toggle__btn--active' : ''}`}
                    onClick={() => setSexo(v)}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Idade */}
            <div className="tmb-calc__group">
              <label className="tmb-calc__label">Idade (anos)</label>
              <div className="tmb-calc__field">
                <input
                  type="number" step="1" min="15" max="100"
                  value={idadeInput}
                  onChange={e => setIdadeInput(e.target.value)}
                  placeholder="Ex.: 32"
                  className="tmb-calc__input"
                />
                <span className="tmb-calc__unit">anos</span>
              </div>
            </div>

            {/* Nível de atividade */}
            <div className="tmb-calc__group">
              <span className="tmb-calc__group-label">Nível de atividade</span>
              <div className="tmb-activity">
                {ACTIVITY_LEVELS.map(a => (
                  <button
                    key={a.id}
                    className={`tmb-activity__btn${activity === a.id ? ' tmb-activity__btn--active' : ''}`}
                    onClick={() => setActivity(a.id)}
                  >
                    <span className="tmb-activity__label">{a.label} <em>({a.factor})</em></span>
                    <span className="tmb-activity__desc">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Peso */}
            <div className="tmb-calc__group">
              <label className="tmb-calc__label">Peso (kg)</label>
              <div className="tmb-calc__field">
                <input
                  type="number" step="0.1" min="30" max="300"
                  value={pesoInput}
                  onChange={e => setPesoInput(e.target.value)}
                  placeholder="Ex.: 72,5"
                  className="tmb-calc__input"
                />
                <span className="tmb-calc__unit">kg</span>
              </div>
            </div>

            {/* Altura */}
            <div className="tmb-calc__group">
              <label className="tmb-calc__label">Altura (cm)</label>
              <div className="tmb-calc__field">
                <input
                  type="number" step="1" min="100" max="250"
                  value={altInput}
                  onChange={e => setAltInput(e.target.value)}
                  placeholder="Ex.: 175"
                  className="tmb-calc__input"
                />
                <span className="tmb-calc__unit">cm</span>
              </div>
            </div>

            {/* Formula note */}
            <div className="tmb-calc__formula-note">
              <strong>Equação revisada (kcal/dia):</strong>
              <p>Homens: 88,362 + 13,397·peso + 4,799·altura − 5,677·idade</p>
              <p>Mulheres: 447,593 + 9,247·peso + 3,098·altura − 4,330·idade</p>
            </div>

            {/* Results */}
            <div className="tmb-calc__results">
              <h2 className="tmb-calc__results-title">Resultados</h2>

              <div className="tmb-results-grid">
                <div className={`tmb-result-card tmb-result-card--primary${!result ? ' tmb-result-card--empty' : ''}`}>
                  <span className="tmb-result-card__value">{result ? result.tmb.toLocaleString('pt-BR') : '—'}</span>
                  <span className="tmb-result-card__unit">kcal/dia</span>
                  <span className="tmb-result-card__label">Taxa Metabólica Basal (TMB)</span>
                  <span className="tmb-result-card__sub">Equação Harris-Benedict (revisada).</span>
                </div>

                <div className={`tmb-result-card${!result ? ' tmb-result-card--empty' : ''}`}>
                  <span className="tmb-result-card__value">{result ? result.tdee.toLocaleString('pt-BR') : '—'}</span>
                  <span className="tmb-result-card__unit">kcal/dia</span>
                  <span className="tmb-result-card__label">Gasto diário estimado (TDEE)</span>
                  <span className="tmb-result-card__sub">
                    {result ? `Fator ${result.factor} · ${result.actLabel}` : 'Fator'}
                  </span>
                  <span className="tmb-result-card__formula">TDEE = TMB × fator de atividade.</span>
                </div>
              </div>

              {!result && (
                <p className="tmb-calc__empty">Informe os dados para calcular os indicadores.</p>
              )}

              {result && (
                <div className="tmb-calc__actions">
                  <button className="tmb-calc__btn" onClick={handleCopy}>
                    {copied ? '✓ Copiado!' : 'Copiar resultado'}
                  </button>
                  <button className="tmb-calc__btn tmb-calc__btn--outline" onClick={() => window.print()}>
                    Imprimir
                  </button>
                </div>
              )}

              <a href={WA} target="_blank" rel="noopener noreferrer" className="tmb-calc__cta">
                Consultar com Dr. Bruno Felix
              </a>

              <p className="tmb-calc__disclaimer">
                Esta ferramenta destina-se a fins educacionais e não substitui o julgamento clínico profissional.
              </p>
            </div>
          </div>

          {/* ── Info ── */}
          <div className="tmb-info">

            <div className="tmb-info__block">
              <h2>O que é a Calculadora de Harris-Benedict (TMB)?</h2>
              <p>A calculadora de Harris-Benedict estima a taxa metabólica basal (TMB) em kcal/dia a partir de sexo, idade, peso e altura. A TMB representa o gasto energético mínimo para manter funções vitais em repouso. Ao aplicar um fator de atividade, a calculadora também estima o gasto energético diário total (TDEE), útil para planejamento nutricional, manejo de peso e periodização em Medicina do Esporte.</p>
              <p>Nesta versão é utilizada a equação revisada de Harris-Benedict, frequentemente citada em materiais de nutrição clínica e esportiva. O resultado é uma estimativa e deve ser interpretado em conjunto com composição corporal, objetivo e resposta ao longo do tempo.</p>
            </div>

            <div className="tmb-info__block">
              <h2>Interpretação dos resultados</h2>
              <p className="tmb-info__lead">Como usar TMB e TDEE na prática</p>
              <p>Em geral, a TMB ajuda a estimar o "piso" do gasto energético em repouso, enquanto o TDEE orienta a manutenção do peso em um dia típico. Para objetivos de perda ou ganho de peso, o TDEE é frequentemente o ponto de partida para definir um balanço energético, sempre considerando sinais clínicos e resposta individual.</p>

              <div className="tmb-info__card">
                <div className="tmb-info__card-header">
                  <strong>Aplicações (geral)</strong>
                  <span>Homens e mulheres</span>
                </div>
                <div className="tmb-info__card-row">
                  <span className="tmb-info__tag tmb-info__tag--green">Manutenção</span>
                  <span>TDEE ≈ ingestão para manter peso</span>
                </div>
                <div className="tmb-info__card-row">
                  <span className="tmb-info__tag tmb-info__tag--blue">Ajuste</span>
                  <span>Use a resposta em 2–4 semanas como guia</span>
                </div>
                <p className="tmb-info__card-desc">Para acompanhamento, priorize tendência de peso, circunferências, composição corporal (quando possível) e desempenho, em vez de confiar apenas no número calculado.</p>
              </div>

              <div className="tmb-info__card tmb-info__card--warn">
                <div className="tmb-info__card-header">
                  <strong>Pontos de atenção</strong>
                  <span>Importante</span>
                </div>
                <div className="tmb-info__card-row">
                  <span className="tmb-info__tag tmb-info__tag--orange">Atletas</span>
                  <span>Grande variação diária de gasto</span>
                </div>
                <div className="tmb-info__card-row">
                  <span className="tmb-info__tag tmb-info__tag--red">Extremos</span>
                  <span>Obesidade / baixo peso — erro maior esperado</span>
                </div>
                <p className="tmb-info__card-desc">Em extremos de composição corporal, gestação/lactação e doenças agudas/crônicas, pode ser necessário método mais específico ou monitoramento mais próximo.</p>
              </div>

              <div className="tmb-info__tips">
                <h3>Dicas rápidas para interpretar</h3>
                <ul>
                  <li>TMB é uma estimativa do gasto em repouso; não representa o gasto do dia inteiro.</li>
                  <li>TDEE depende fortemente do fator de atividade: escolha o fator mais coerente com sua rotina média.</li>
                  <li>Se o resultado parecer incoerente, revise as unidades (kg e cm), a idade e o nível de atividade selecionado.</li>
                  <li>Mudanças de ingestão e gasto devem ser acompanhadas clinicamente quando houver condições médicas, uso de medicações ou objetivos agressivos de perda/ganho de peso.</li>
                </ul>
              </div>
            </div>

            {/* CTA block */}
            <div className="tmb-info__cta-block">
              <div className="tmb-info__cta-text">
                <strong>Quer um plano individualizado?</strong>
                <p>Consulte o Dr. Bruno Felix para avaliação de composição corporal, orientação nutricional e de atividade física conforme seu objetivo.</p>
              </div>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="tmb-info__cta-btn">
                Agendar consulta
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
