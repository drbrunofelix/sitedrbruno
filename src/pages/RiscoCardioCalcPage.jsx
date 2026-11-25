import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { prevent10y, ckdEpi2021, classifyRisk, CATEGORY_INFO } from '../lib/cardio'
import { num, fmt, waLink, Seg, YesNo, NumField, TargetsTable, GUIDELINE_SOURCE } from './cardioUi'
import './CardioCalc.css'

const ENHANCERS = [
  { id: 'familia', text: 'Pai, mãe ou irmão(ã) com infarto ou AVC precoce (homem antes dos 55 anos, mulher antes dos 65)' },
  { id: 'adiposidade', text: 'Obesidade (IMC ≥ 30 com cintura aumentada), gordura no fígado (esteatose) ou síndrome metabólica' },
  { id: 'inflamatoria', text: 'Doença inflamatória crônica: artrite reumatoide, psoríase, lúpus, doença inflamatória intestinal ou HIV' },
  { id: 'transplante', text: 'Transplante de coração, fígado ou rim' },
  { id: 'pcr', text: 'PCR ultrassensível ≥ 2,0 mg/L' },
  { id: 'gestacao', female: true, text: 'Pré-eclâmpsia, eclâmpsia, hipertensão ou diabetes na gestação, parto prematuro, restrição de crescimento do bebê ou 3 ou mais abortos espontâneos' },
  { id: 'menopausa', female: true, text: 'Menopausa precoce (antes dos 40 anos)' },
  { id: 'menarca', female: true, text: 'Primeira menstruação aos 12 anos ou antes, ou aos 17 anos ou depois' },
]

export default function RiscoCardioCalcPage() {
  const [event, setEvent] = useState(null)
  const [sex, setSex] = useState(null)
  const [age, setAge] = useState('')
  const [tc, setTc] = useState('')
  const [hdl, setHdl] = useState('')
  const [sbp, setSbp] = useState('')
  const [bpTx, setBpTx] = useState(null)
  const [statin, setStatin] = useState(null)
  const [dm, setDm] = useState(null)
  const [smoker, setSmoker] = useState(null)
  const [egfrMode, setEgfrMode] = useState('tfg')
  const [egfrIn, setEgfrIn] = useState('')
  const [creat, setCreat] = useState('')
  const [ldl, setLdl] = useState('')
  const [lpa, setLpa] = useState('')
  const [imaging, setImaging] = useState('')
  const [enh, setEnh] = useState({})
  const [copied, setCopied] = useState(false)

  const egfr = useMemo(() => {
    if (egfrMode === 'tfg') return num(egfrIn)
    const v = ckdEpi2021({ creatinine: num(creat), age: num(age), sex })
    return v == null || !sex ? NaN : Math.round(v)
  }, [egfrMode, egfrIn, creat, age, sex])

  const missing = [
    event === null && 'responder se já teve evento cardiovascular',
    !sex && 'sexo',
    !age && 'idade',
    !tc && 'colesterol total',
    !hdl && 'HDL',
    !sbp && 'pressão sistólica',
    bpTx === null && 'remédio para pressão',
    statin === null && 'estatina',
    dm === null && 'diabetes',
    smoker === null && 'tabagismo',
    !Number.isFinite(egfr) && (egfrMode === 'tfg' ? 'TFG' : 'creatinina'),
  ].filter(Boolean)

  const result = (() => {
    if (event !== false || missing.length) return null
    const risk = prevent10y({ sex, age: num(age), tc: num(tc), hdl: num(hdl), sbp: num(sbp), bpTx, statin, dm, smoker, egfr })
    if (risk.error) return { error: risk.error }
    const lpaN = num(lpa)
    const enhancer = ENHANCERS.some((e) => enh[e.id] && (!e.female || sex === 'F')) || (Number.isFinite(lpaN) && lpaN >= 50)
    const cls = classifyRisk({ ascvd10: risk.ascvd, enhancer, dm, ldl: num(ldl), lpa: lpaN, imaging })
    return { ...risk, ...cls }
  })()

  const info = result && !result.error ? CATEGORY_INFO[result.category] : null
  const ldlN = num(ldl)

  const handleCopy = () => {
    if (!info) return
    const text = [
      'Calculadora de Risco Cardiovascular (PREVENT) — Dr. Bruno Felix',
      `${sex === 'F' ? 'Mulher' : 'Homem'}, ${age} anos · CT ${tc} · HDL ${hdl} mg/dL · PAS ${sbp} mmHg · TFG ${egfr}`,
      `Risco de doença cardiovascular aterosclerótica em 10 anos: ${fmt(result.ascvd * 100, 1)}%`,
      `Categoria (Diretriz SBC 2025): ${info.label}`,
      `Metas: LDL < ${info.ldl} mg/dL · não-HDL < ${info.nonHdl} mg/dL · redução mínima do LDL ≥ ${info.reduction}%`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cv-page">
      <div className="cv-page__header">
        <div className="container">
          <div className="cv-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>Risco cardiovascular</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="cv-page__title">Calculadora de Risco Cardiovascular</h1>
          <p className="cv-page__subtitle">
            Estime o risco de infarto e AVC em 10 anos pelo escore PREVENT, recomendado pela Diretriz Brasileira de Dislipidemias 2025, e veja sua categoria de risco e as metas de LDL.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="cv-layout">
          <div className="cv-calc">
            <div className="cv-calc__inputs">
              <div className="cv-calc__field">
                <label className="cv-calc__label">Já teve infarto, AVC, angina com obstrução, stent ou ponte de safena, ou doença arterial periférica com sintomas?</label>
                <Seg value={event} onChange={setEvent} label="Evento cardiovascular prévio" options={[[true, 'Sim'], [false, 'Não']]} />
              </div>

              {event !== true && (
                <>
                  <div className="cv-calc__row">
                    <div className="cv-calc__field">
                      <label className="cv-calc__label">Sexo</label>
                      <Seg value={sex} onChange={setSex} label="Sexo" options={[['F', 'Feminino'], ['M', 'Masculino']]} />
                    </div>
                    <NumField label="Idade" unit="anos" value={age} onChange={setAge} placeholder="30 a 79" />
                  </div>
                  <div className="cv-calc__row">
                    <NumField label="Colesterol total" unit="mg/dL" value={tc} onChange={setTc} placeholder="Ex.: 200" />
                    <NumField label="HDL" unit="mg/dL" value={hdl} onChange={setHdl} placeholder="Ex.: 50" />
                  </div>
                  <NumField label="Pressão sistólica (a máxima)" unit="mmHg" value={sbp} onChange={setSbp} placeholder="Ex.: 120 (12 por 8 = 120)" />

                  <div className="cv-box">
                    <YesNo label="Usa remédio para pressão?" value={bpTx} onChange={setBpTx} />
                    <YesNo label="Usa estatina (remédio para colesterol)?" value={statin} onChange={setStatin} />
                    <YesNo label="Tem diabetes?" value={dm} onChange={setDm} />
                    <YesNo label="Fuma atualmente?" value={smoker} onChange={setSmoker} />
                  </div>

                  <div className="cv-calc__field">
                    <label className="cv-calc__label">Função dos rins</label>
                    <Seg value={egfrMode} onChange={setEgfrMode} label="Como informar a função renal" options={[['tfg', 'Sei a TFG'], ['cr', 'Pela creatinina']]} />
                  </div>
                  {egfrMode === 'tfg' ? (
                    <NumField label="TFG / eGFR" unit="mL/min/1,73 m²" value={egfrIn} onChange={setEgfrIn} placeholder="Ex.: 90" hint="Aparece no resultado do exame de creatinina como “TFG” ou “eGFR”." />
                  ) : (
                    <NumField
                      label="Creatinina"
                      unit="mg/dL"
                      step="0.01"
                      value={creat}
                      onChange={setCreat}
                      placeholder="Ex.: 0,9"
                      hint={Number.isFinite(egfr) ? `TFG calculada (CKD-EPI 2021): ${egfr} mL/min/1,73 m²` : 'A TFG é calculada pela equação CKD-EPI 2021 (precisa de sexo e idade).'}
                    />
                  )}

                  <details className="cv-details">
                    <summary>Refinar a classificação (opcional)</summary>
                    <div className="cv-details__body">
                      <div className="cv-calc__row">
                        <NumField label="LDL" unit="mg/dL" value={ldl} onChange={setLdl} placeholder="Ex.: 130" />
                        <NumField label="Lipoproteína(a)" unit="mg/dL" value={lpa} onChange={setLpa} placeholder="Se tiver" />
                      </div>
                      <div className="cv-calc__field">
                        <label className="cv-calc__label">Exame de aterosclerose (escore de cálcio, ultrassom de carótidas ou angiotomografia)</label>
                        <select className="cv-calc__select" value={imaging} onChange={(e) => setImaging(e.target.value)}>
                          <option value="">Não fiz / normal</option>
                          <option value="alto">Placa com obstrução menor que 50%, ou escore de cálcio acima de 100</option>
                          <option value="muito-alto">Escore de cálcio acima de 300, ou obstrução de 50% ou mais</option>
                        </select>
                      </div>
                      <span className="cv-calc__label">Fatores agravantes</span>
                      {ENHANCERS.filter((e) => !e.female || sex === 'F').map((e) => (
                        <label key={e.id} className="cv-check">
                          <input type="checkbox" checked={!!enh[e.id]} onChange={(ev) => setEnh({ ...enh, [e.id]: ev.target.checked })} />
                          {e.text}
                        </label>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </div>

            <div className="cv-results">
              <h2 className="cv-results__title">Resultado</h2>

              {event === true ? (
                <>
                  <div className="cv-alert cv-alert--info">
                    <strong>A calculadora não se aplica a quem já teve um evento cardiovascular.</strong>
                    Nesse caso, a diretriz já classifica a pessoa como <b>muito alto</b> ou <b>extremo</b> risco, com meta de LDL abaixo de 50 ou de 40 mg/dL. O acompanhamento deve ser individualizado.
                  </div>
                  <a href={waLink('Olá, Dr. Bruno! Já tive um evento cardiovascular e gostaria de agendar uma consulta.')} target="_blank" rel="noopener noreferrer" className="cv-cta">
                    Agendar consulta com Dr. Bruno Felix
                  </a>
                </>
              ) : !result ? (
                <p className="cv-results__empty">
                  {missing.length ? `Falta preencher: ${missing.join(', ')}.` : 'Preencha os dados para calcular.'}
                </p>
              ) : result.error ? (
                <div className="cv-alert">
                  <strong>O escore PREVENT foi validado para:</strong>
                  {result.error.join('; ')}.
                  {num(age) < 30 && ' Abaixo de 30 anos ainda não existe um escore validado; a avaliação é feita em consulta.'}
                  {num(age) > 79 && ' Acima de 79 anos o risco deve ser avaliado individualmente em consulta.'}
                </div>
              ) : (
                <>
                  <div className="cv-value-card" style={{ '--result-color': info.color }}>
                    <span className="cv-value-card__kicker">Risco de infarto ou AVC em 10 anos</span>
                    <span className="cv-value-card__value">{fmt(result.ascvd * 100, 1)}%</span>
                    <span className="cv-value-card__unit">PREVENT · doença cardiovascular aterosclerótica</span>
                    <span className="cv-value-card__label">{info.label}</span>
                  </div>

                  <div className="cv-stats">
                    <div className="cv-stat">
                      <span className="cv-stat__label">Meta de LDL</span>
                      <span className="cv-stat__value">&lt; {info.ldl} <small>mg/dL</small></span>
                    </div>
                    <div className="cv-stat">
                      <span className="cv-stat__label">Meta não-HDL</span>
                      <span className="cv-stat__value">&lt; {info.nonHdl} <small>mg/dL</small></span>
                    </div>
                    <div className="cv-stat">
                      <span className="cv-stat__label">Redução mínima</span>
                      <span className="cv-stat__value">≥ {info.reduction}%</span>
                    </div>
                  </div>

                  <ul className="cv-reasons">
                    {result.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                    <li>Doença cardiovascular total (inclui insuficiência cardíaca): {fmt(result.total * 100, 1)}% em 10 anos</li>
                  </ul>

                  {Number.isFinite(ldlN) && (
                    <div className={`cv-goal ${ldlN < info.ldl ? 'cv-goal--ok' : 'cv-goal--off'}`}>
                      Seu LDL ({fmt(ldlN)} mg/dL) está {ldlN < info.ldl ? 'dentro da meta.' : 'acima da meta.'}
                    </div>
                  )}

                  {dm && (
                    <div className="cv-alert">
                      <strong>Diabetes tem critérios próprios</strong>
                      A diretriz considera tempo de doença, idade, lesões em rins, olhos ou nervos e outros fatores. A categoria real pode ser alto ou muito alto risco. Confirme em consulta.
                    </div>
                  )}

                  <div className="cv-actions">
                    <button className="cv-btn" onClick={handleCopy}>
                      {copied ? '✓ Copiado!' : 'Copiar resultado'}
                    </button>
                    <button className="cv-btn cv-btn--outline" onClick={() => window.print()}>
                      Imprimir
                    </button>
                  </div>

                  <a href={waLink('Olá, Dr. Bruno! Calculei meu risco cardiovascular no site e gostaria de agendar uma consulta.')} target="_blank" rel="noopener noreferrer" className="cv-cta">
                    Agendar consulta com Dr. Bruno Felix
                  </a>
                </>
              )}

              <p className="cv-disclaimer">
                Esta ferramenta destina-se a fins educacionais e não substitui o julgamento clínico profissional. O risco estimado é uma média populacional e não prevê o que vai acontecer com cada pessoa.
              </p>
            </div>
          </div>

          <div className="cv-info">
            <div className="cv-info__block">
              <h2>O que esta calculadora mostra?</h2>
              <p>
                Ela estima a chance de ter um infarto, um AVC ou morrer por doença coronariana nos próximos 10 anos, em pessoas de 30 a 79 anos que ainda não tiveram doença cardiovascular. O resultado define a categoria de risco, que orienta quão baixo o LDL precisa ficar.
              </p>
            </div>

            <div className="cv-info__block">
              <h2>O escore PREVENT</h2>
              <p>
                O PREVENT foi desenvolvido pela American Heart Association (2024) com dados de mais de 6 milhões de pessoas. Ele usa idade, sexo, colesterol, pressão, diabetes, tabagismo, uso de remédios e a função dos rins. A Diretriz Brasileira de Dislipidemias 2025 o recomenda como ferramenta preferencial de estratificação de risco.
              </p>
              <p>
                Pela diretriz: risco abaixo de 5% em 10 anos é <b>baixo</b>; de 5% a menos de 20%, <b>intermediário</b>; 20% ou mais, <b>alto</b>. Fatores agravantes sobem uma categoria, e algumas condições (LDL ≥ 190 mg/dL, Lp(a) &gt; 180 mg/dL, placas em exames de imagem) já classificam como alto risco.
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
                <li>Não se aplica a quem já teve infarto, AVC ou outra doença aterosclerótica manifesta.</li>
                <li>Validado de 30 a 79 anos.</li>
                <li>Em diabetes, hipercolesterolemia familiar e doença renal crônica, a diretriz usa critérios adicionais.</li>
                <li>Para calcular o LDL a partir do exame, use a <Link className="cv-link" to="/calculadoras/ldl">calculadora de LDL</Link>.</li>
              </ul>
              <p className="cv-source">
                Referências: Khan SS et al. Circulation 2024 (equações PREVENT); Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025 (SBC), Tabelas 4.1, 4.3 e 5.1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
