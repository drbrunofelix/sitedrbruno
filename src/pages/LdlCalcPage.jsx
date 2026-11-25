import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calcLdl, CATEGORIES, CATEGORY_INFO } from '../lib/cardio'
import { num, fmt, waLink, NumField, TargetsTable, GUIDELINE_SOURCE } from './cardioUi'
import './CardioCalc.css'

export default function LdlCalcPage() {
  const [tc, setTc] = useState('')
  const [hdl, setHdl] = useState('')
  const [tg, setTg] = useState('')
  const [cat, setCat] = useState('')
  const [copied, setCopied] = useState(false)

  const r = useMemo(() => calcLdl({ tc: num(tc), hdl: num(hdl), tg: num(tg) }), [tc, hdl, tg])
  const goal = cat && r && (r.status === 'ok' || r.status === 'tg-alto') ? CATEGORY_INFO[cat] : null

  const handleCopy = () => {
    if (!r || r.status === 'invalido') return
    const lines = [
      'Calculadora de LDL — Dr. Bruno Felix',
      `Colesterol total: ${tc} mg/dL · HDL: ${hdl} mg/dL · Triglicerídeos: ${tg} mg/dL`,
      r.status === 'ok' ? `LDL (Martin/Hopkins): ${fmt(r.ldl)} mg/dL` : 'LDL: não calculado (triglicerídeos ≥ 400 mg/dL)',
      `Colesterol não-HDL: ${fmt(r.nonHdl)} mg/dL`,
    ]
    if (goal) lines.push(`Metas (${goal.label}): LDL < ${goal.ldl} mg/dL · não-HDL < ${goal.nonHdl} mg/dL`)
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ldlColor = r?.status === 'ok' ? (r.ldl < 100 ? '#16a34a' : r.ldl < 160 ? '#d97706' : '#dc2626') : '#157875'

  return (
    <div className="cv-page">
      <div className="cv-page__header">
        <div className="container">
          <div className="cv-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>LDL</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="cv-page__title">Calculadora de LDL-colesterol</h1>
          <p className="cv-page__subtitle">
            Calcule o LDL pela equação de Martin/Hopkins, recomendada pela Diretriz Brasileira de Dislipidemias 2025, e compare com a meta da sua categoria de risco.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="cv-layout">
          <div className="cv-calc">
            <div className="cv-calc__inputs">
              <NumField label="Colesterol total" unit="mg/dL" value={tc} onChange={setTc} placeholder="Ex.: 200" />
              <NumField label="HDL-colesterol" unit="mg/dL" value={hdl} onChange={setHdl} placeholder="Ex.: 50" />
              <NumField label="Triglicerídeos" unit="mg/dL" value={tg} onChange={setTg} placeholder="Ex.: 150" />
              <div className="cv-calc__field">
                <label className="cv-calc__label">Sua categoria de risco (opcional)</label>
                <select className="cv-calc__select" value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="">Não sei / não comparar</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_INFO[c].label}
                    </option>
                  ))}
                </select>
                <span className="cv-calc__hint">
                  Não sabe? Use a <Link className="cv-link" to="/calculadoras/risco-cardiovascular">calculadora de risco cardiovascular</Link>.
                </span>
              </div>
            </div>

            <div className="cv-results">
              <h2 className="cv-results__title">Resultados</h2>

              {!r ? (
                <p className="cv-results__empty">Informe colesterol total, HDL e triglicerídeos do seu exame.</p>
              ) : r.status === 'invalido' ? (
                <div className="cv-alert">{r.msg}</div>
              ) : (
                <>
                  {r.status === 'ok' ? (
                    <div className="cv-value-card" style={{ '--result-color': ldlColor }}>
                      <span className="cv-value-card__kicker">LDL-colesterol estimado</span>
                      <span className="cv-value-card__value">{fmt(r.ldl)}</span>
                      <span className="cv-value-card__unit">mg/dL · Martin/Hopkins</span>
                    </div>
                  ) : (
                    <div className="cv-alert">
                      <strong>Triglicerídeos a partir de 400 mg/dL</strong>
                      Nesse caso, as fórmulas perdem precisão e o LDL não deve ser estimado. Use o colesterol não-HDL (abaixo) e, se possível, peça o LDL dosado diretamente.
                      {num(tg) > 440 && ' Se o exame não foi em jejum, vale repetir com 12 horas de jejum.'}
                    </div>
                  )}

                  <div className="cv-stats">
                    <div className="cv-stat">
                      <span className="cv-stat__label">Não-HDL</span>
                      <span className="cv-stat__value">
                        {fmt(r.nonHdl)} <small>mg/dL</small>
                      </span>
                    </div>
                    {r.status === 'ok' && (
                      <>
                        <div className="cv-stat">
                          <span className="cv-stat__label">Fator usado</span>
                          <span className="cv-stat__value">{fmt(r.factor, 1)}</span>
                        </div>
                        <div className="cv-stat">
                          <span className="cv-stat__label">Friedewald (antiga)</span>
                          <span className="cv-stat__value">
                            {fmt(r.friedewald)} <small>mg/dL</small>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {goal && (
                    <GoalCheck goal={goal} ldl={r.status === 'ok' ? r.ldl : null} nonHdl={r.nonHdl} />
                  )}

                  <div className="cv-actions">
                    <button className="cv-btn" onClick={handleCopy}>
                      {copied ? '✓ Copiado!' : 'Copiar resultado'}
                    </button>
                    <button className="cv-btn cv-btn--outline" onClick={() => window.print()}>
                      Imprimir
                    </button>
                  </div>

                  <a
                    href={waLink('Olá, Dr. Bruno! Calculei meu LDL no site e gostaria de agendar uma consulta.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-cta"
                  >
                    Agendar consulta com Dr. Bruno Felix
                  </a>
                </>
              )}

              <p className="cv-disclaimer">
                Esta ferramenta destina-se a fins educacionais e não substitui o julgamento clínico profissional. A meta de LDL é definida pelo médico conforme o risco individual.
              </p>
            </div>
          </div>

          <div className="cv-info">
            <div className="cv-info__block">
              <h2>O que é o LDL-colesterol?</h2>
              <p>
                O LDL é a fração do colesterol transportada pelas lipoproteínas de baixa densidade. Ele é o principal alvo no tratamento das dislipidemias: quanto maior e por mais tempo o LDL fica elevado, maior o risco de aterosclerose, infarto e AVC.
              </p>
              <p>
                O colesterol não-HDL (colesterol total menos HDL) reúne todas as partículas que podem causar aterosclerose. Pela diretriz de 2025, ele é alvo coprimário, junto com o LDL, e é especialmente útil quando os triglicerídeos estão altos.
              </p>
            </div>

            <div className="cv-info__block">
              <h2>Como o cálculo funciona?</h2>
              <p>A maioria dos laboratórios estima o LDL a partir do perfil lipídico. A Diretriz Brasileira de Dislipidemias 2025 recomenda a equação de Martin/Hopkins para todos:</p>
              <div className="cv-formula">LDL = Colesterol total − HDL − (Triglicerídeos ÷ fator)</div>
              <p>
                O fator varia de 3,1 a 9,5 e é escolhido numa tabela de 180 combinações de triglicerídeos e colesterol não-HDL. A fórmula antiga de Friedewald usa sempre o fator 5 e tende a subestimar o LDL quando ele está baixo ou quando os triglicerídeos estão altos.
              </p>
            </div>

            <div className="cv-info__block">
              <h2>Metas por categoria de risco</h2>
              <TargetsTable />
              <p className="cv-source">{GUIDELINE_SOURCE}</p>
            </div>

            <div className="cv-info__block">
              <h2>Limitações</h2>
              <ul>
                <li>Com triglicerídeos a partir de 400 mg/dL, o LDL não é estimado: use o não-HDL ou o LDL dosado diretamente.</li>
                <li>O exame sem jejum é aceito; se os triglicerídeos sem jejum passarem de 440 mg/dL, a diretriz sugere repetir em jejum de 12 horas.</li>
                <li>A categoria de risco depende de histórico, exames e outras condições, e deve ser confirmada em consulta.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoalCheck({ goal, ldl, nonHdl }) {
  const ldlOk = ldl == null ? null : ldl < goal.ldl
  const nonOk = nonHdl < goal.nonHdl
  const ok = (ldlOk ?? true) && nonOk
  const pct = ldl != null && !ldlOk ? Math.ceil(((ldl - goal.ldl + 1) / ldl) * 100) : null
  return (
    <div className={`cv-goal ${ok ? 'cv-goal--ok' : 'cv-goal--off'}`}>
      <strong>{goal.label}:</strong> meta de LDL &lt; {goal.ldl} mg/dL e não-HDL &lt; {goal.nonHdl} mg/dL.
      <br />
      {ok
        ? 'Seus valores estão dentro da meta.'
        : `Acima da meta${pct ? `: seria preciso reduzir o LDL em cerca de ${pct}%` : ''}.`}
    </div>
  )
}
