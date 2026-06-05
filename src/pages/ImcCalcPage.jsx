import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './ImcCalcPage.css'

function getClassification(imc) {
  if (imc < 18.5) return { label: 'Baixo peso', color: '#3b82f6', index: 0 }
  if (imc < 25)   return { label: 'Peso adequado (Eutrofia)', color: '#22c55e', index: 1 }
  if (imc < 30)   return { label: 'Sobrepeso', color: '#f59e0b', index: 2 }
  return           { label: 'Obesidade', color: '#ef4444', index: 3 }
}

// Bar range: 10–40 (30 units). Marker pos = (imc - 10) / 30 * 100%
function markerPos(imc) {
  return Math.min(Math.max((imc - 10) / 30 * 100, 1.5), 98.5)
}

export default function ImcCalcPage() {
  const [peso, setPeso]     = useState('')
  const [altura, setAltura] = useState('')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    const p = parseFloat(peso.replace(',', '.'))
    const a = parseFloat(altura.replace(',', '.'))
    if (isNaN(p) || isNaN(a) || p <= 0 || a <= 0) return null
    const alturaM = a / 100
    const imc = p / (alturaM * alturaM)
    return { imc, classification: getClassification(imc) }
  }, [peso, altura])

  const handleCopy = () => {
    if (!result) return
    const text = [
      'Calculadora IMC — Dr. Bruno Felix',
      `Peso: ${peso} kg · Altura: ${altura} cm`,
      `IMC: ${result.imc.toFixed(1).replace('.', ',')} kg/m²`,
      `Classificação: ${result.classification.label}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="imc-page">
      <div className="imc-page__header">
        <div className="container">
          <div className="imc-page__breadcrumb">
            <Link to="/calculadoras">Calculadoras</Link>
            <span>›</span>
            <span>IMC</span>
          </div>
          <p className="section-label">Calculadora</p>
          <h1 className="imc-page__title">Calculadora de IMC</h1>
          <p className="imc-page__subtitle">
            Informe peso e altura para calcular o IMC e visualizar a faixa no gráfico.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="imc-layout">

          {/* Left: inputs + results */}
          <div className="imc-calc">
            <div className="imc-calc__inputs">
              <div className="imc-calc__field">
                <label className="imc-calc__label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={peso}
                  onChange={e => setPeso(e.target.value)}
                  placeholder="Ex.: 72.5"
                  className="imc-calc__input"
                />
              </div>
              <div className="imc-calc__field">
                <label className="imc-calc__label">Altura (cm)</label>
                <input
                  type="number"
                  step="1"
                  min="50"
                  max="250"
                  value={altura}
                  onChange={e => setAltura(e.target.value)}
                  placeholder="Ex.: 170"
                  className="imc-calc__input"
                />
              </div>
            </div>

            <div className="imc-calc__results">
              <h2 className="imc-calc__results-title">Resultados</h2>

              {!result ? (
                <p className="imc-calc__empty">Informe os dados para calcular os indicadores.</p>
              ) : (
                <>
                  <div
                    className="imc-calc__value-card"
                    style={{ '--result-color': result.classification.color }}
                  >
                    <span className="imc-calc__value">
                      {result.imc.toFixed(1).replace('.', ',')}
                    </span>
                    <span className="imc-calc__value-unit">kg/m²</span>
                    <span className="imc-calc__classification">
                      {result.classification.label}
                    </span>
                  </div>

                  {/* BMI bar */}
                  <div className="imc-bar">
                    <div className="imc-bar__track">
                      <div className="imc-bar__seg imc-bar__seg--blue"   title="Baixo peso" />
                      <div className="imc-bar__seg imc-bar__seg--green"  title="Peso adequado" />
                      <div className="imc-bar__seg imc-bar__seg--yellow" title="Sobrepeso" />
                      <div className="imc-bar__seg imc-bar__seg--red"    title="Obesidade" />
                      <div
                        className="imc-bar__marker"
                        style={{ '--pos': `${markerPos(result.imc)}%` }}
                      />
                    </div>
                    <div className="imc-bar__labels">
                      <span style={{ left: '0%' }}>10</span>
                      <span style={{ left: '28.3%' }}>18,5</span>
                      <span style={{ left: '50%' }}>25</span>
                      <span style={{ left: '66.7%' }}>30</span>
                      <span style={{ left: '100%' }}>40+</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="imc-calc__actions">
                    <button className="imc-calc__btn" onClick={handleCopy}>
                      {copied ? '✓ Copiado!' : 'Copiar resultado'}
                    </button>
                    <button className="imc-calc__btn imc-calc__btn--outline" onClick={() => window.print()}>
                      Imprimir
                    </button>
                  </div>

                  {/* WhatsApp CTA */}
                  <a
                    href="https://wa.me/5548988313457?text=Ol%C3%A1%2C%20Dr.%20Bruno%21%20Calculei%20meu%20IMC%20e%20gostaria%20de%20agendar%20uma%20consulta."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="imc-calc__cta"
                  >
                    Agendar consulta com Dr. Bruno Felix
                  </a>
                </>
              )}

              <p className="imc-calc__disclaimer">
                Esta ferramenta destina-se a fins educacionais e não substitui o julgamento clínico profissional.
              </p>
            </div>
          </div>

          {/* Right: educational content */}
          <div className="imc-info">
            <div className="imc-info__block">
              <h2>O que é a Calculadora de IMC?</h2>
              <p>A Calculadora de IMC (Índice de Massa Corporal) é uma ferramenta utilizada para estimar o estado nutricional em adultos a partir da relação entre peso e altura.</p>
            </div>

            <div className="imc-info__block">
              <h2>Como a fórmula do IMC funciona?</h2>
              <p>O IMC é calculado pela fórmula clássica proposta por Quetelet:</p>
              <div className="imc-formula">
                IMC = Peso (kg) ÷ Altura² (m)
              </div>
              <div className="imc-info__vars">
                <strong>Variáveis utilizadas</strong>
                <ul>
                  <li>Peso corporal: em quilogramas (kg)</li>
                  <li>Altura: em metros (m)</li>
                </ul>
              </div>
              <div className="imc-info__tip">
                <strong>Dica rápida</strong>
                <p>Se sua altura estiver em centímetros, divida por 100 para obter a altura em metros. Ex.: 170 cm → 1,70 m.</p>
              </div>
            </div>

            <div className="imc-info__block">
              <h2>Interpretação dos resultados</h2>
              <p>Classificação para adultos segundo a OMS:</p>
              <div className="imc-table">
                <div className="imc-table__row imc-table__row--blue">
                  <span className="imc-table__range">IMC &lt; 18,5</span>
                  <span className="imc-table__label">Baixo peso</span>
                </div>
                <div className="imc-table__row imc-table__row--green">
                  <span className="imc-table__range">18,5 – 24,9</span>
                  <span className="imc-table__label">Peso adequado (Eutrofia)</span>
                </div>
                <div className="imc-table__row imc-table__row--yellow">
                  <span className="imc-table__range">25,0 – 29,9</span>
                  <span className="imc-table__label">Sobrepeso</span>
                </div>
                <div className="imc-table__row imc-table__row--red">
                  <span className="imc-table__range">≥ 30,0</span>
                  <span className="imc-table__label">Obesidade</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
