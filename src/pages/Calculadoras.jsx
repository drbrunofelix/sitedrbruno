import { Link } from 'react-router-dom'
import './Calculadoras.css'

export default function Calculadoras() {
  return (
    <div className="calc-page">
      <div className="calc-page__header">
        <div className="container">
          <p className="section-label">Ferramentas</p>
          <h1 className="calc-page__title">Calculadoras de Saúde</h1>
          <p className="calc-page__subtitle">
            Ferramentas práticas para monitorar sua saúde e performance. Os resultados são orientativos — consulte sempre um médico para avaliação individualizada.
          </p>
        </div>
      </div>

      <div className="container calc-page__grid">
        <Link to="/calculadoras/semaglutida" className="calc-card calc-card--active">
          <div className="calc-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h2 className="calc-card__title">Calculadora de Semaglutida</h2>
          <p className="calc-card__desc">Calcule doses e fracionamento das canetas Wegovy®, Ozempic®, Poviztra® e Extensior® com volume em mL e número de cliques.</p>
          <span className="calc-card__badge calc-card__badge--active">Disponível</span>
        </Link>
        <Link to="/calculadoras/imc" className="calc-card calc-card--active">
          <div className="calc-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="calc-card__title">IMC — Índice de Massa Corporal</h2>
          <p className="calc-card__desc">Calcule seu IMC e veja em qual faixa você se encontra segundo os critérios da OMS.</p>
          <span className="calc-card__badge calc-card__badge--active">Disponível</span>
        </Link>

        <Link to="/calculadoras/zonas-fc" className="calc-card calc-card--active">
          <div className="calc-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h2 className="calc-card__title">Zonas de Frequência Cardíaca</h2>
          <p className="calc-card__desc">Descubra suas zonas de treino Z1–Z5 com base na FCmáx e objetivos.</p>
          <span className="calc-card__badge calc-card__badge--active">Disponível</span>
        </Link>

        <Link to="/calculadoras/tmb" className="calc-card calc-card--active">
          <div className="calc-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="calc-card__title">Gasto Calórico Diário (TMB)</h2>
          <p className="calc-card__desc">Estime sua Taxa Metabólica Basal e o gasto diário total (TDEE) pela equação de Harris-Benedict revisada.</p>
          <span className="calc-card__badge calc-card__badge--active">Disponível</span>
        </Link>

      </div>
    </div>
  )
}
