import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './ZonasFreqCalcPage.css'

const ZONES = [
  { id: 'Z1', pct: [50, 60],  label: 'Recuperação / leve',       color: '#3b82f6' },
  { id: 'Z2', pct: [60, 70],  label: 'Base aeróbica',            color: '#22c55e' },
  { id: 'Z3', pct: [70, 80],  label: 'Ritmo / moderado',         color: '#f59e0b' },
  { id: 'Z4', pct: [80, 90],  label: 'Limiar / forte',           color: '#f97316' },
  { id: 'Z5', pct: [90, 100], label: 'Máximo / intervalado',     color: '#ef4444' },
]

const FORMULAS = [
  { id: 'classic', label: '220 − idade',            hint: 'Fórmula clássica', fn: age => 220 - age },
  { id: 'tanaka',  label: '208 − 0,7 × idade',      hint: 'Tanaka et al.',    fn: age => Math.round(208 - 0.7 * age) },
  { id: 'gellish', label: '207 − 0,7 × idade',      hint: 'Gellish et al.',   fn: age => Math.round(207 - 0.7 * age) },
]

export default function ZonasFreqCalcPage() {
  const [sexo, setSexo]       = useState('M')
  const [mode, setMode]       = useState('direct')
  const [fcmax, setFcmax]     = useState('')
  const [idade, setIdade]     = useState('')
  const [formula, setFormula] = useState('classic')
  const [copied, setCopied]   = useState(false)

  const result = useMemo(() => {
    let fc = null
    if (mode === 'direct') {
      const v = parseFloat(fcmax)
      if (!isNaN(v) && v >= 60 && v <= 240) fc = Math.round(v)
    } else {
      const age = parseFloat(idade)
      if (!isNaN(age) && age >= 10 && age <= 100) {
        const f = FORMULAS.find(f => f.id === formula)
        fc = f.fn(age)
      }
    }
    if (!fc) return null
    return {
      fcmax: fc,
      zones: ZONES.map(z => ({
        ...z,
        min: Math.round(fc * z.pct[0] / 100),
        max: Math.round(fc * z.pct[1] / 100),
      })),
    }
  }, [mode, fcmax, idade, formula])

  const WA_LINK = 'https://wa.me/5548988313457?text=Ol%C3%A1%2C%20Dr.%20Bruno%21%20Tenho%20d%C3%BAvidas%20sobre%20zonas%20de%20treinamento%20e%20gostaria%20de%20consultar.'

  const handleCopy = () => {
    if (!result) return
    const header = `Zonas de Treinamento — Dr. Bruno Felix\nFCmáx: ${result.fcmax} bpm\n`
    const rows = result.zones.map(z =>
      `${z.id}  ${z.pct[0]}–${z.pct[1]}%  ${z.min}–${z.max} bpm  ${z.label}`
    ).join('\n')
    navigator.clipboard.writeText(header + rows)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="zonas-page">
      <div className="zonas-page__header">
        <div className="container">
          <div className="zonas-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>Zonas de FC</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="zonas-page__title">Zonas de Treinamento por Frequência Cardíaca</h1>
          <p className="zonas-page__subtitle">
            Calcula as zonas Z1–Z5 por % da FCmáx. Informe a FCmáx diretamente ou estime pela idade usando uma fórmula.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="zonas-layout">

          {/* ── Calculator ── */}
          <div className="zonas-calc">

            {/* Sexo */}
            <div className="zonas-calc__group">
              <span className="zonas-calc__group-label">Sexo</span>
              <div className="zonas-toggle">
                {[['M','Masculino'],['F','Feminino']].map(([v,l]) => (
                  <button
                    key={v}
                    className={`zonas-toggle__btn${sexo === v ? ' zonas-toggle__btn--active' : ''}`}
                    onClick={() => setSexo(v)}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="zonas-calc__group">
              <span className="zonas-calc__group-label">Como definir FCmáx</span>
              <div className="zonas-toggle">
                <button
                  className={`zonas-toggle__btn${mode === 'direct' ? ' zonas-toggle__btn--active' : ''}`}
                  onClick={() => setMode('direct')}
                >Informar FCmáx (bpm)</button>
                <button
                  className={`zonas-toggle__btn${mode === 'estimate' ? ' zonas-toggle__btn--active' : ''}`}
                  onClick={() => setMode('estimate')}
                >Estimar pela idade</button>
              </div>
            </div>

            {/* Direct */}
            {mode === 'direct' && (
              <div className="zonas-calc__group">
                <label className="zonas-calc__label">FCmáx (bpm)</label>
                <div className="zonas-calc__field">
                  <input
                    type="number"
                    step="1"
                    min="60"
                    max="240"
                    value={fcmax}
                    onChange={e => setFcmax(e.target.value)}
                    placeholder="Ex.: 190"
                    className="zonas-calc__input"
                  />
                  <span className="zonas-calc__unit">bpm</span>
                </div>
                <p className="zonas-calc__hint">Se você tiver teste ou medida real, prefira informar diretamente.</p>
              </div>
            )}

            {/* Estimate */}
            {mode === 'estimate' && (
              <>
                <div className="zonas-calc__group">
                  <label className="zonas-calc__label">Idade (anos)</label>
                  <div className="zonas-calc__field">
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="100"
                      value={idade}
                      onChange={e => setIdade(e.target.value)}
                      placeholder="Ex.: 35"
                      className="zonas-calc__input"
                    />
                    <span className="zonas-calc__unit">anos</span>
                  </div>
                </div>
                <div className="zonas-calc__group">
                  <span className="zonas-calc__label">Fórmula de estimativa</span>
                  <div className="zonas-formulas">
                    {FORMULAS.map(f => (
                      <button
                        key={f.id}
                        className={`zonas-formula-btn${formula === f.id ? ' zonas-formula-btn--active' : ''}`}
                        onClick={() => setFormula(f.id)}
                      >
                        <strong>{f.label}</strong>
                        <span>{f.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <p className="zonas-calc__zones-note">
              Zonas padrão: Z1 50–60% · Z2 60–70% · Z3 70–80% · Z4 80–90% · Z5 90–100% da FCmáx.
            </p>

            {/* Results */}
            <div className="zonas-calc__results">
              <h2 className="zonas-calc__results-title">Resultados</h2>

              <div className={`zonas-fcmax-card${!result ? ' zonas-fcmax-card--empty' : ''}`}>
                <div>
                  <span className="zonas-fcmax-card__value">{result ? result.fcmax : '—'}</span>
                  <span className="zonas-fcmax-card__unit"> bpm</span>
                </div>
                <span className="zonas-fcmax-card__label">FCmáx usada no cálculo</span>
                {result && <span className="zonas-fcmax-card__sub">Base para calcular as zonas por percentuais.</span>}
              </div>

              {!result ? (
                <p className="zonas-calc__empty">Informe os dados para calcular os indicadores.</p>
              ) : (
                <>
                  <div className="zonas-table">
                    <div className="zonas-table__head">
                      <span>Zona</span>
                      <span>% FCmáx</span>
                      <span>Faixa (bpm)</span>
                      <span className="zonas-table__desc-col">Descrição</span>
                    </div>
                    {result.zones.map(z => (
                      <div
                        key={z.id}
                        className="zonas-table__row"
                        style={{ '--zc': z.color }}
                      >
                        <span className="zonas-table__id">{z.id}</span>
                        <span className="zonas-table__pct">{z.pct[0]}–{z.pct[1]}%</span>
                        <span className="zonas-table__bpm">{z.min}–{z.max}</span>
                        <span className="zonas-table__label zonas-table__desc-col">{z.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="zonas-calc__table-note">
                    As descrições são gerais e podem variar conforme modalidade e prescrição.
                  </p>

                  <div className="zonas-calc__actions">
                    <button className="zonas-calc__btn-action" onClick={handleCopy}>
                      {copied ? '✓ Copiado!' : 'Copiar resultado'}
                    </button>
                    <button className="zonas-calc__btn-action zonas-calc__btn-action--outline" onClick={() => window.print()}>
                      Imprimir
                    </button>
                  </div>
                </>
              )}

              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="zonas-calc__cta">
                Consultar com Dr. Bruno Felix
              </a>

              <p className="zonas-calc__disclaimer">
                Esta ferramenta destina-se a fins educacionais e não substitui o julgamento clínico profissional.
              </p>
            </div>
          </div>

          {/* ── Info ── */}
          <div className="zonas-info">

            <div className="zonas-info__block">
              <h2>O que é a Calculadora de Zonas de Treinamento?</h2>
              <p>A calculadora de zonas de treinamento por frequência cardíaca converte a FCmáx em faixas de treino (bpm) usando percentuais padronizados, organizados em 5 zonas (Z1–Z5). Ela pode usar uma FCmáx informada (preferencial) ou estimar a FCmáx pela idade com equações clássicas (220 − idade, Tanaka e Gellish). Na prática, essas zonas auxiliam a prescrição e o monitoramento da intensidade em corrida, ciclismo, esportes coletivos e reabilitação, desde que interpretadas no contexto clínico e do objetivo do treino.</p>
            </div>

            <div className="zonas-info__block">
              <h2>Interpretação dos resultados</h2>
              <p className="zonas-info__lead">O que cada zona geralmente representa</p>
              <p>As zonas descrevem faixas de intensidade que tendem a se associar a diferentes respostas fisiológicas. Abaixo, um guia prático (generalista) para interpretação, lembrando que a relação entre FCmáx e limiares varia entre indivíduos.</p>

              <div className="zonas-info__group">
                <div className="zonas-info__group-header zonas-info__group-header--low">
                  <strong>Z1–Z2</strong>
                  <span>Leve a moderado</span>
                </div>
                <div className="zonas-info__zone-row">
                  <span className="zonas-info__badge" style={{ '--zc': '#3b82f6' }}>Z1 (50–60%)</span>
                  <span>Recuperação / leve</span>
                </div>
                <div className="zonas-info__zone-row">
                  <span className="zonas-info__badge" style={{ '--zc': '#22c55e' }}>Z2 (60–70%)</span>
                  <span>Base aeróbica</span>
                </div>
                <p className="zonas-info__group-desc">Úteis para volume, recuperação ativa, condicionamento inicial e parte do treino contínuo. Em reabilitação, a meta de intensidade pode ser definida por protocolos específicos e supervisão.</p>
              </div>

              <div className="zonas-info__group">
                <div className="zonas-info__group-header zonas-info__group-header--high">
                  <strong>Z3–Z5</strong>
                  <span>Moderado a máximo</span>
                </div>
                <div className="zonas-info__zone-row">
                  <span className="zonas-info__badge" style={{ '--zc': '#f59e0b' }}>Z3 (70–80%)</span>
                  <span>Ritmo / sustentado</span>
                </div>
                <div className="zonas-info__zone-row">
                  <span className="zonas-info__badge" style={{ '--zc': '#f97316' }}>Z4 (80–90%)</span>
                  <span>Limiar / forte</span>
                </div>
                <div className="zonas-info__zone-row">
                  <span className="zonas-info__badge" style={{ '--zc': '#ef4444' }}>Z5 (90–100%)</span>
                  <span>Máximo / intervalado</span>
                </div>
                <p className="zonas-info__group-desc">Em geral, Z4–Z5 aumentam demanda cardiorrespiratória e exigem maior recuperação. A tolerância varia com aptidão, modalidade e presença de comorbidades.</p>
              </div>
            </div>

            {/* CTA block */}
            <div className="zonas-info__cta-block">
              <div className="zonas-info__cta-text">
                <strong>Quer entender melhor suas zonas de treino?</strong>
                <p>Tire suas dúvidas ou agende uma consulta com prescrição individualizada e baseada em evidências.</p>
              </div>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="zonas-info__cta-btn">
                Falar com Dr. Bruno Felix
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
