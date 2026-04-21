interface FormulaTooltipProps {
  label?: string
  title: string
  formula: string
  sourceLabel: string
}

export function FormulaTooltip({ label = 'Ver criterio', title, formula, sourceLabel }: FormulaTooltipProps) {
  return (
    <details className="formula-tooltip">
      <summary>{label}</summary>
      <div className="formula-tooltip__panel">
        <strong>{title}</strong>
        <code>{formula}</code>
        <span>Apoyo del corpus: {sourceLabel}</span>
      </div>
    </details>
  )
}
