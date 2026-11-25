// Cálculos das calculadoras de LDL e de risco cardiovascular.
// Fontes:
// - Martin SS et al. JAMA 2013;310(19):2061-2068, Figura 2 (tabela de 180 fatores).
// - Khan SS et al. Circulation 2024;149:430-449 (equações PREVENT, modelo base, 10 anos),
//   coeficientes conferidos no pacote R "preventr" 0.12.2 (sysdata: base_10yr).
// - CKD-EPI 2021 sem raça (Inker LA et al. NEJM 2021) para a TFG.
// - Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025 (SBC):
//   Martin/Hopkins para todos; PREVENT (DCVA em 10 anos, 30–79 anos); Tabelas 4.1 e 5.1.

// ---------------------------------------------------------------- LDL

// Limite inferior de cada faixa de triglicerídeos (mg/dL) da tabela de Martin/Hopkins.
const MH_TG = [7, 50, 57, 62, 67, 72, 76, 80, 84, 88, 93, 97, 101, 106, 111, 116, 121, 127, 133, 139, 147, 155, 164, 174, 186, 202, 221, 248, 293]
// Colunas: não-HDL <100, 100–129, 130–159, 160–189, 190–219, ≥220 mg/dL.
const MH_FACTORS = [
  [3.5, 3.4, 3.3, 3.3, 3.2, 3.1], //   7–49
  [4.0, 3.9, 3.7, 3.6, 3.6, 3.4], //  50–56
  [4.3, 4.1, 4.0, 3.9, 3.8, 3.6], //  57–61
  [4.5, 4.3, 4.1, 4.0, 3.9, 3.9], //  62–66
  [4.7, 4.4, 4.3, 4.2, 4.1, 3.9], //  67–71
  [4.8, 4.6, 4.4, 4.2, 4.2, 4.1], //  72–75
  [4.9, 4.6, 4.5, 4.3, 4.3, 4.2], //  76–79
  [5.0, 4.8, 4.6, 4.4, 4.3, 4.2], //  80–83
  [5.1, 4.8, 4.6, 4.5, 4.4, 4.3], //  84–87
  [5.2, 4.9, 4.7, 4.6, 4.4, 4.3], //  88–92
  [5.3, 5.0, 4.8, 4.7, 4.5, 4.4], //  93–96
  [5.4, 5.1, 4.8, 4.7, 4.5, 4.3], //  97–100
  [5.5, 5.2, 5.0, 4.7, 4.6, 4.5], // 101–105
  [5.6, 5.3, 5.0, 4.8, 4.6, 4.5], // 106–110
  [5.7, 5.4, 5.1, 4.9, 4.7, 4.5], // 111–115
  [5.8, 5.5, 5.2, 5.0, 4.8, 4.6], // 116–120
  [6.0, 5.5, 5.3, 5.0, 4.8, 4.6], // 121–126
  [6.1, 5.7, 5.3, 5.1, 4.9, 4.7], // 127–132
  [6.2, 5.8, 5.4, 5.2, 5.0, 4.7], // 133–138
  [6.3, 5.9, 5.6, 5.3, 5.0, 4.8], // 139–146
  [6.5, 6.0, 5.7, 5.4, 5.1, 4.8], // 147–154
  [6.7, 6.2, 5.8, 5.4, 5.2, 4.9], // 155–163
  [6.8, 6.3, 5.9, 5.5, 5.3, 5.0], // 164–173
  [7.0, 6.5, 6.0, 5.7, 5.4, 5.1], // 174–185
  [7.3, 6.7, 6.2, 5.8, 5.5, 5.2], // 186–201
  [7.6, 6.9, 6.4, 6.0, 5.6, 5.3], // 202–220
  [8.0, 7.2, 6.6, 6.2, 5.9, 5.4], // 221–247
  [8.5, 7.6, 7.0, 6.5, 6.1, 5.6], // 248–292
  [9.5, 8.3, 7.5, 7.0, 6.5, 5.9], // 293–399
]
const MH_NONHDL = [100, 130, 160, 190, 220]

export const LDL_LIMITS = { tc: [50, 600], hdl: [10, 200], tg: [7, 2000], tgCalcMax: 399 }

export function martinHopkinsFactor(tg, nonHdl) {
  let row = 0
  for (let i = 0; i < MH_TG.length; i++) if (tg >= MH_TG[i]) row = i
  let col = MH_NONHDL.findIndex((cut) => nonHdl < cut)
  if (col === -1) col = 5
  return MH_FACTORS[row][col]
}

// Retorna { nonHdl, ldl, factor, friedewald, status } — status: 'ok' | 'tg-alto' | 'invalido'
export function calcLdl({ tc, hdl, tg }) {
  if (![tc, hdl, tg].every(Number.isFinite)) return null
  if (tc < LDL_LIMITS.tc[0] || tc > LDL_LIMITS.tc[1] || hdl < LDL_LIMITS.hdl[0] || hdl > LDL_LIMITS.hdl[1] || tg < LDL_LIMITS.tg[0] || tg > LDL_LIMITS.tg[1])
    return { status: 'invalido', msg: 'Confira os valores: algum está fora da faixa esperada para exames de sangue.' }
  if (hdl >= tc) return { status: 'invalido', msg: 'O HDL não pode ser maior ou igual ao colesterol total.' }
  const nonHdl = tc - hdl
  if (tg > LDL_LIMITS.tgCalcMax) return { status: 'tg-alto', nonHdl }
  const factor = martinHopkinsFactor(tg, nonHdl)
  const ldl = nonHdl - tg / factor
  const friedewald = nonHdl - tg / 5
  if (ldl <= 0) return { status: 'invalido', msg: 'Com esses valores o cálculo não é confiável. Confira o exame.' }
  return { status: 'ok', nonHdl, ldl, factor, friedewald }
}

// ---------------------------------------------------------------- TFG (CKD-EPI 2021)

export function ckdEpi2021({ creatinine, age, sex }) {
  if (!Number.isFinite(creatinine) || creatinine <= 0 || !Number.isFinite(age)) return null
  const female = sex === 'F'
  const k = female ? 0.7 : 0.9
  const a = female ? -0.241 : -0.302
  const r = creatinine / k
  return 142 * Math.min(r, 1) ** a * Math.max(r, 1) ** -1.2 * 0.9938 ** age * (female ? 1.012 : 1)
}

// ---------------------------------------------------------------- PREVENT (modelo base, 10 anos)

// Ordem: idade, não-HDL, HDL, PAS<110, PAS≥110, diabetes, tabagismo, TFG<60, TFG≥60, anti-hipertensivo,
// estatina, anti-hipertensivo×PAS≥110, estatina×não-HDL, idade×não-HDL, idade×HDL, idade×PAS≥110,
// idade×diabetes, idade×tabagismo, idade×TFG<60, constante. (Termos de IMC têm coeficiente 0 nestes desfechos.)
const PREVENT = {
  F: {
    ascvd: [0.719883, 0.1176967, -0.151185, -0.0835358, 0.3592852, 0.8348585, 0.4831078, 0.4864619, 0.0397779, 0.2265309, -0.0592374, -0.0395762, 0.0844423, -0.0567839, 0.0325692, -0.1035985, -0.2417542, -0.0791142, -0.1671492, -3.819975],
    total: [0.7939329, 0.0305239, -0.1606857, -0.2394003, 0.3600781, 0.8667604, 0.5360739, 0.6045917, 0.0433769, 0.3151672, -0.1477655, -0.0663612, 0.1197879, -0.0819715, 0.0306769, -0.0946348, -0.27057, -0.078715, -0.1637806, -3.307728],
  },
  M: {
    ascvd: [0.7099847, 0.1658663, -0.1144285, -0.2837212, 0.3239977, 0.7189597, 0.3956973, 0.3690075, 0.0203619, 0.2036522, -0.0865581, -0.0322916, 0.114563, -0.0300005, 0.0232747, -0.0927024, -0.2018525, -0.0970527, -0.1217081, -3.500655],
    total: [0.7688528, 0.0736174, -0.0954431, -0.4347345, 0.3362658, 0.7692857, 0.4386871, 0.5378979, 0.0164827, 0.288879, -0.1337349, -0.0475924, 0.150273, -0.0517874, 0.0191169, -0.1049477, -0.2251948, -0.0895067, -0.1543702, -3.031168],
  },
}

export const PREVENT_LIMITS = { age: [30, 79], sbp: [90, 200], tc: [130, 320], hdl: [20, 100], egfr: [15, 140] }

const MMOL = 0.02586

// Retorna { ascvd, total } em fração (0–1) ou { error } se algum valor estiver fora da faixa validada.
export function prevent10y({ sex, age, tc, hdl, sbp, bpTx, statin, dm, smoker, egfr }) {
  const L = PREVENT_LIMITS
  const out = []
  if (!(age >= L.age[0] && age <= L.age[1])) out.push(`idade entre ${L.age[0]} e ${L.age[1]} anos`)
  if (!(tc >= L.tc[0] && tc <= L.tc[1])) out.push(`colesterol total entre ${L.tc[0]} e ${L.tc[1]} mg/dL`)
  if (!(hdl >= L.hdl[0] && hdl <= L.hdl[1])) out.push(`HDL entre ${L.hdl[0]} e ${L.hdl[1]} mg/dL`)
  if (!(sbp >= L.sbp[0] && sbp <= L.sbp[1])) out.push(`pressão sistólica entre ${L.sbp[0]} e ${L.sbp[1]} mmHg`)
  if (!(egfr >= L.egfr[0] && egfr <= L.egfr[1])) out.push(`TFG entre ${L.egfr[0]} e ${L.egfr[1]} mL/min/1,73 m²`)
  if (out.length) return { error: out }
  if (hdl >= tc) return { error: ['HDL menor que o colesterol total'] }

  const a = (age - 55) / 10
  const nh = (tc - hdl) * MMOL - 3.5
  const h = (hdl * MMOL - 1.3) / 0.3
  const sLt = (Math.min(sbp, 110) - 110) / 20
  const sGe = (Math.max(sbp, 110) - 130) / 20
  const eLt = (Math.min(egfr, 60) - 60) / -15
  const eGe = (Math.max(egfr, 60) - 90) / -15
  const b = bpTx ? 1 : 0
  const st = statin ? 1 : 0
  const d = dm ? 1 : 0
  const sm = smoker ? 1 : 0
  const x = [a, nh, h, sLt, sGe, d, sm, eLt, eGe, b, st, b * sGe, st * nh, a * nh, a * h, a * sGe, a * d, a * sm, a * eLt, 1]
  const risk = (coefs) => {
    const lo = coefs.reduce((s, c, i) => s + c * x[i], 0)
    return Math.exp(lo) / (1 + Math.exp(lo))
  }
  return { ascvd: risk(PREVENT[sex].ascvd), total: risk(PREVENT[sex].total) }
}

// ---------------------------------------------------------------- categorias e metas (Diretriz SBC 2025)

export const CATEGORIES = ['baixo', 'intermediario', 'alto', 'muito-alto', 'extremo']

export const CATEGORY_INFO = {
  baixo: { label: 'Baixo risco', color: '#16a34a', ldl: 115, nonHdl: 145, reduction: 30 },
  intermediario: { label: 'Risco intermediário', color: '#d97706', ldl: 100, nonHdl: 130, reduction: 30 },
  alto: { label: 'Alto risco', color: '#dc2626', ldl: 70, nonHdl: 100, reduction: 50 },
  'muito-alto': { label: 'Muito alto risco', color: '#9f1239', ldl: 50, nonHdl: 80, reduction: 50 },
  extremo: { label: 'Risco extremo', color: '#581c87', ldl: 40, nonHdl: 70, reduction: 50 },
}

const atLeast = (cat, min) => (CATEGORIES.indexOf(cat) >= CATEGORIES.indexOf(min) ? cat : min)

// Classificação para quem NÃO teve evento cardiovascular (Tabela 4.1).
// Retorna { category, reasons[] }.
export function classifyRisk({ ascvd10, enhancer, dm, ldl, lpa, imaging }) {
  const reasons = []
  let cat = ascvd10 < 0.05 ? 'baixo' : ascvd10 < 0.2 ? 'intermediario' : 'alto'
  reasons.push(`PREVENT ${(ascvd10 * 100).toFixed(1).replace('.', ',')}% em 10 anos`)

  if (enhancer && cat === 'baixo') { cat = 'intermediario'; reasons.push('fator agravante presente (baixo → intermediário)') }
  else if (enhancer && cat === 'intermediario') { cat = 'alto'; reasons.push('fator agravante presente (intermediário → alto)') }

  if (dm && cat === 'baixo') { cat = 'intermediario'; reasons.push('diabetes (não se classifica como baixo risco)') }

  if (Number.isFinite(ldl)) {
    if (ldl >= 190) { cat = atLeast(cat, 'alto'); reasons.push('LDL ≥ 190 mg/dL') }
    else if (ldl >= 160) { cat = atLeast(cat, 'intermediario'); reasons.push('LDL entre 160 e 189 mg/dL') }
  }
  if (Number.isFinite(lpa) && lpa > 180) { cat = atLeast(cat, 'alto'); reasons.push('Lp(a) > 180 mg/dL') }
  if (imaging === 'alto') { cat = atLeast(cat, 'alto'); reasons.push('aterosclerose subclínica em exame de imagem') }
  if (imaging === 'muito-alto') { cat = atLeast(cat, 'muito-alto'); reasons.push('escore de cálcio > 300 ou obstrução ≥ 50%') }
  return { category: cat, reasons }
}
