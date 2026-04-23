import { sourceIndex } from '../../game/content/sourceMap'

interface FormulaTooltipProps {
  label?: string
  title: string
  formula: string
  sourceIds: string[]
}

export function FormulaTooltip({ label = 'Ver criterio', title, formula, sourceIds }: FormulaTooltipProps) {
  const sources = sourceIds
    .map((sourceId) => sourceIndex[sourceId])
    .filter(Boolean)

  return (
    <details className="formula-tooltip">
      <summary>{label}</summary>
      <div className="formula-tooltip__panel">
        <strong>{title}</strong>
        <code>{formula}</code>
        <span>
          Apoyo del corpus:
          {' '}
          {sources.map((source, index) => (
            <span key={source.id}>
              <a className="source-link" href={source.driveLinks[0]?.url} rel="noreferrer" target="_blank">
                {source.label}
              </a>
              {index < sources.length - 1 ? ' · ' : null}
            </span>
          ))}
        </span>
      </div>
    </details>
  )
}
