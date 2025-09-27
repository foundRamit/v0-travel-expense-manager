import type { AppData } from "./types"

type LR = { slope: number; intercept: number }

function linearRegression(xs: number[], ys: number[]): LR {
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const sumXX = xs.reduce((a, x) => a + x * x, 0)
  const denom = n * sumXX - sumX * sumX || 1
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/**
 * Predict total spend for a group using a linear trend of cumulative spend vs. expense index.
 * We project 3 steps ahead to estimate the final total for the trip (tunable).
 */
export function predictTotalForGroup(data: AppData, groupId: string, lookahead = 3): number {
  const expenses = data.expenses.filter((e) => e.groupId === groupId).sort((a, b) => (a.date < b.date ? -1 : 1))

  const totals = expenses.reduce<number[]>((arr, e, i) => {
    const prev = i === 0 ? 0 : arr[i - 1]
    arr.push(prev + (e.amount || 0))
    return arr
  }, [])

  const currentTotal = totals[totals.length - 1] || 0
  const n = totals.length
  if (n < 2) return currentTotal

  const xs = Array.from({ length: n }, (_, i) => i + 1)
  const { slope, intercept } = linearRegression(xs, totals)
  const xFuture = n + lookahead
  const predicted = intercept + slope * xFuture
  // Clamp to at least currentTotal and avoid negative/NaN
  const safe = Number.isFinite(predicted) ? Math.max(predicted, currentTotal) : currentTotal
  return Number(safe.toFixed(2))
}
