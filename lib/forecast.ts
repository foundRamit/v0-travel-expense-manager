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

// Helper to enumerate dates inclusive and map spends
function isoDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10)
}
function addDays(iso: string, d: number) {
  const dt = new Date(iso)
  dt.setDate(dt.getDate() + d)
  return isoDay(dt)
}
function diffDaysInclusive(aIso: string, bIso: string) {
  const a = new Date(aIso)
  const b = new Date(bIso)
  const ms = 24 * 60 * 60 * 1000
  return Math.max(1, Math.floor((b.getTime() - a.getTime()) / ms) + 1)
}

/**
 * Predict total spend using linear regression on cumulative spend per day.
 * If the group has start/end dates, fill zero-spend days across the trip range
 * and project to the trip end date. Otherwise, fallback to projecting a few days ahead.
 */
export function predictTotalForGroup(data: AppData, groupId: string, lookahead = 3): number {
  const group = data.groups.find((g) => g.id === groupId)
  const expenses = data.expenses.filter((e) => e.groupId === groupId).sort((a, b) => (a.date < b.date ? -1 : 1))

  if (expenses.length === 0) return 0

  // Build map of spend by ISO day from expenses
  const spendByDay = new Map<string, number>()
  for (const e of expenses) {
    const day = new Date(e.date).toISOString().slice(0, 10)
    spendByDay.set(day, (spendByDay.get(day) || 0) + (e.amount || 0))
  }

  let days: string[] = []
  if (group?.startDate && group?.endDate) {
    // Use trip date range; observed period ends today or endDate, whichever is earlier
    const start = group.startDate
    const todayIso = isoDay(new Date())
    const observedEnd = group.endDate < todayIso ? group.endDate : todayIso
    const observedLen = diffDaysInclusive(start, observedEnd)
    days = Array.from({ length: observedLen }, (_, i) => addDays(start, i))
  } else {
    // Fallback to days observed in expenses only
    days = Array.from(spendByDay.keys()).sort()
  }

  // Daily totals across chosen days
  const dailyTotals = days.map((d) => spendByDay.get(d) || 0)
  // Cumulative series
  const totals = dailyTotals.reduce<number[]>((arr, amt, i) => {
    const prev = i === 0 ? 0 : arr[i - 1]
    arr.push(prev + amt)
    return arr
  }, [])

  const currentTotal = totals[totals.length - 1] || 0
  const n = totals.length
  if (n < 2) {
    // If only 1 day observed, scale proportionally if trip dates exist
    if (group?.startDate && group?.endDate) {
      const tripLen = diffDaysInclusive(group.startDate, group.endDate)
      const scaled = (currentTotal / Math.max(1, n)) * tripLen
      return Number(Math.max(currentTotal, scaled).toFixed(2))
    }
    return currentTotal
  }

  const xs = Array.from({ length: n }, (_, i) => i + 1)
  const { slope, intercept } = linearRegression(xs, totals)

  let xTarget: number
  if (group?.startDate && group?.endDate) {
    xTarget = diffDaysInclusive(group.startDate, group.endDate)
  } else {
    xTarget = n + lookahead
  }

  const predicted = intercept + slope * xTarget
  const safe = Number.isFinite(predicted) ? Math.max(predicted, currentTotal) : currentTotal
  return Number(safe.toFixed(2))
}
