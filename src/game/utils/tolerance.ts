export const DEFAULT_DECIMAL_TOLERANCE = 0.05

export function withinTolerance(value: number, expected: number, tolerance = DEFAULT_DECIMAL_TOLERANCE) {
  return Math.abs(value - expected) <= tolerance
}
