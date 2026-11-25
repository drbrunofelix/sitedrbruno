import { CATEGORIES, CATEGORY_INFO } from '../lib/cardio'

export const WHATSAPP = '5548988313457'
export const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`

export const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}
export const fmt = (n, d = 0) => n.toFixed(d).replace('.', ',')

export function Seg({ value, onChange, options, label }) {
  return (
    <div className="cv-seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

export function YesNo({ label, value, onChange }) {
  return (
    <div className="cv-yesno">
      <span>{label}</span>
      <Seg value={value} onChange={onChange} label={label} options={[[true, 'Sim'], [false, 'Não']]} />
    </div>
  )
}

export function NumField({ label, unit, value, onChange, placeholder, hint, step = '1' }) {
  return (
    <div className="cv-calc__field">
      <label className="cv-calc__label">
        {label}
        {unit ? ` (${unit})` : ''}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="cv-calc__input"
      />
      {hint && <span className="cv-calc__hint">{hint}</span>}
    </div>
  )
}

export function TargetsTable() {
  return (
    <table className="cv-table">
      <thead>
        <tr>
          <th>Categoria</th>
          <th>Meta LDL</th>
          <th>Meta não-HDL</th>
          <th>Redução mínima do LDL</th>
        </tr>
      </thead>
      <tbody>
        {CATEGORIES.map((c) => {
          const i = CATEGORY_INFO[c]
          return (
            <tr key={c}>
              <td>
                <span className="cv-dot" style={{ background: i.color }} />
                {i.label}
              </td>
              <td>&lt; {i.ldl} mg/dL</td>
              <td>&lt; {i.nonHdl} mg/dL</td>
              <td>≥ {i.reduction}%</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export const GUIDELINE_SOURCE =
  'Fonte das metas: Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025 (Sociedade Brasileira de Cardiologia), Tabela 5.1.'
