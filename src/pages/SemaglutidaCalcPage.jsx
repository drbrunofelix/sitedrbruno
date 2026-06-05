import { useState } from 'react'
import { Link } from 'react-router-dom'
import './SemaglutidaCalcPage.css'

const PENS = [
  {
    id: 'p025',
    dose: '0,25 mg',
    concentration: 0.68,
    volume: 1.5,
    products: 'Wegovy®',
  },
  {
    id: 'p05',
    dose: '0,5 mg',
    concentration: 1.34,
    volume: 1.5,
    products: 'Wegovy®',
  },
  {
    id: 'p1',
    dose: '1 mg',
    concentration: 1.34,
    volume: 3.0,
    products: 'Wegovy® · Ozempic® · Extensior®',
    highlight: true,
  },
  {
    id: 'p17',
    dose: '1,7 mg',
    concentration: 2.27,
    volume: 3.0,
    products: 'Wegovy®',
  },
  {
    id: 'p24',
    dose: '2,4 mg',
    concentration: 3.20,
    volume: 3.0,
    products: 'Wegovy®',
  },
]

export default function SemaglutidaCalcPage() {
  const [selectedPenId, setSelectedPenId] = useState(null)
  const [doseInput, setDoseInput] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [copied, setCopied] = useState(false)

  const pen = PENS.find(p => p.id === selectedPenId)
  const desiredDose = parseFloat(doseInput.replace(',', '.'))
  const penPrice = parseFloat(priceInput)

  let result = null
  if (pen && !isNaN(desiredDose) && desiredDose > 0) {
    const volumeMl = desiredDose / pen.concentration
    const clicks = Math.round(volumeMl * 100)
    const totalMg = pen.concentration * pen.volume
    const dosesPerPen = Math.floor(totalMg / desiredDose)
    const isValid = desiredDose <= totalMg

    let costPerDose = null
    let costPerMg = null
    if (!isNaN(penPrice) && penPrice > 0 && dosesPerPen > 0) {
      costPerDose = penPrice / dosesPerPen
      costPerMg = penPrice / totalMg
    }

    result = { volumeMl, clicks, totalMg, dosesPerPen, isValid, costPerDose, costPerMg }
  }

  const handleCopy = () => {
    if (!result?.isValid) return
    const lines = [
      'Calculadora Semaglutida — Dr. Bruno Felix',
      `Caneta: ${pen.dose} · ${pen.concentration.toString().replace('.', ',')}mg/mL · ${pen.volume}mL`,
      `Dose desejada: ${doseInput.replace('.', ',')}mg`,
      `Volume a aspirar: ${result.volumeMl.toFixed(2).replace('.', ',')}mL`,
      `Cliques: ${result.clicks}`,
      `Doses por caneta: ${result.dosesPerPen}`,
    ]
    if (result.costPerDose) {
      lines.push(`Custo por dose: R$ ${result.costPerDose.toFixed(2).replace('.', ',')}`)
    }
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmtNum = (n) => n.toFixed(2).replace('.', ',')

  return (
    <div className="sema-page">
      <div className="sema-page__header">
        <div className="container">
          <div className="sema-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>Semaglutida</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="sema-page__title">Calculadora de Semaglutida</h1>
          <p className="sema-page__subtitle">
            Wegovy®, Ozempic®, Poviztra® e Extensior® — cálculo de doses e fracionamento por caneta.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="sema-calc">

          {/* Step 1: Pen */}
          <div className="sema-calc__step">
            <h2 className="sema-calc__step-title">
              <span className="sema-calc__step-num">1</span>
              Qual caneta de semaglutida você tem?
            </h2>
            <div className="sema-pens">
              {PENS.map(p => (
                <button
                  key={p.id}
                  className={`sema-pen${selectedPenId === p.id ? ' sema-pen--active' : ''}${p.highlight ? ' sema-pen--highlight' : ''}`}
                  onClick={() => { setSelectedPenId(p.id); setDoseInput('') }}
                >
                  <strong className="sema-pen__dose">{p.dose}</strong>
                  <span className="sema-pen__conc">{p.concentration.toString().replace('.', ',')}mg/mL</span>
                  <span className="sema-pen__vol">{p.volume}mL total</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Dose */}
          {pen && (
            <div className="sema-calc__step">
              <h2 className="sema-calc__step-title">
                <span className="sema-calc__step-num">2</span>
                Dose desejada
              </h2>
              <div className="sema-calc__input-wrap">
                <div className="sema-calc__field">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max={pen.concentration * pen.volume}
                    value={doseInput}
                    onChange={e => setDoseInput(e.target.value)}
                    placeholder="ex: 0.25"
                    className="sema-calc__input"
                  />
                  <span className="sema-calc__unit">mg</span>
                </div>
                <p className="sema-calc__pen-info">
                  Caneta com {fmtNum(pen.concentration * pen.volume)}mg total · {pen.concentration.toString().replace('.', ',')}mg/mL
                </p>
              </div>

              {result && !result.isValid && (
                <div className="sema-calc__error">
                  ⚠️ Dose excede o conteúdo total da caneta ({fmtNum(result.totalMg)}mg)
                </div>
              )}

              {result?.isValid && (
                <div className="sema-calc__result">
                  <div className="sema-calc__result-grid">
                    <div className="sema-calc__stat sema-calc__stat--primary">
                      <span className="sema-calc__stat-value">{result.clicks}</span>
                      <span className="sema-calc__stat-label">cliques</span>
                    </div>
                    <div className="sema-calc__stat">
                      <span className="sema-calc__stat-value">{result.dosesPerPen}</span>
                      <span className="sema-calc__stat-label">doses por caneta</span>
                    </div>
                  </div>

                  {/* Cost calculator */}
                  <div className="sema-calc__cost">
                    <label className="sema-calc__cost-label">
                      Calcular custo por dose — digite o preço da caneta
                    </label>
                    <div className="sema-calc__cost-row">
                      <span className="sema-calc__currency">R$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={priceInput}
                        onChange={e => setPriceInput(e.target.value)}
                        placeholder="ex: 1299"
                        className="sema-calc__input sema-calc__input--cost"
                      />
                    </div>
                    {result.costPerDose && (
                      <div className="sema-calc__cost-results">
                        <div className="sema-calc__cost-item">
                          <span>Custo por dose</span>
                          <strong>R$ {fmtNum(result.costPerDose)}</strong>
                        </div>
                        <div className="sema-calc__cost-item">
                          <span>Custo por mg</span>
                          <strong>R$ {fmtNum(result.costPerMg)}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="sema-calc__actions">
                    <button className="sema-calc__btn" onClick={handleCopy}>
                      {copied ? '✓ Copiado!' : 'Copiar resultado'}
                    </button>
                    <button
                      className="sema-calc__btn sema-calc__btn--outline"
                      onClick={() => window.print()}
                    >
                      Imprimir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="sema-calc__cta">
          <div className="sema-calc__cta-inner">
            <div className="sema-calc__cta-text">
              <strong>Quer acompanhamento médico personalizado?</strong>
              <p>Consulta presencial em Florianópolis ou teleconsulta para todo o Brasil.</p>
            </div>
            <a
              href="https://wa.me/5548988313457?text=Ol%C3%A1%2C%20Dr.%20Bruno%21%20Gostaria%20de%20agendar%20uma%20teleconsulta."
              target="_blank"
              rel="noopener noreferrer"
              className="sema-calc__cta-btn"
            >
              Agendar consulta
            </a>
          </div>
        </div>

        {/* Notices */}
        <div className="sema-calc__notices">
          <div className="sema-calc__notice sema-calc__notice--warning">
            <h3>⚠️ Aviso Importante</h3>
            <p>Esta calculadora é uma ferramenta de auxílio e não substitui a orientação médica. A dosagem e o uso do medicamento devem ser seguidos conforme a prescrição do seu médico. O fracionamento de doses só deve ser feito sob supervisão profissional.</p>
          </div>
          <div className="sema-calc__notice sema-calc__notice--info">
            <h3>ℹ️ Aviso Legal</h3>
            <p>Esta ferramenta tem finalidade exclusivamente educativa e de auxílio ao cálculo. Não constitui prescrição, recomendação de uso ou endosso de nenhum medicamento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
