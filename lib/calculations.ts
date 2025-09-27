// Expense calculations and summaries
import type { AppData, Group, SettlementTransaction } from "./types"

export function getGroupById(data: AppData, groupId?: string): Group | undefined {
  if (!groupId) return undefined
  return data.groups.find((g) => g.id === groupId)
}

export function getGroupTotals(data: AppData, groupId: string) {
  const expenses = data.expenses.filter((e) => e.groupId === groupId)
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  // Per-member balances: positive means they are owed money, negative means they owe
  const group = getGroupById(data, groupId)
  const memberBalances: Record<string, number> = {}
  if (group) {
    for (const m of group.members) memberBalances[m.id] = 0
    for (const e of expenses) {
      const share = e.splitMemberIds.length > 0 ? e.amount / e.splitMemberIds.length : 0
      // Payer paid amount
      memberBalances[e.paidByMemberId] += e.amount
      // Each participant owes their share
      for (const mid of e.splitMemberIds) {
        memberBalances[mid] -= share
      }
    }
  }

  return { total, byCategory, memberBalances }
}

export function getRecentActivity(data: AppData, limit = 8) {
  return [...data.activity].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit)
}

export function getSettlementPlan(data: AppData, groupId: string): SettlementTransaction[] {
  const group = getGroupById(data, groupId)
  if (!group) return []

  // Reuse balances from totals: +ve => to receive, -ve => to pay
  const { memberBalances } = getGroupTotals(data, groupId)

  // Build creditor and debtor lists
  type Entry = { id: string; amt: number }
  const creditors: Entry[] = []
  const debtors: Entry[] = []

  for (const m of group.members) {
    const bal = Number((memberBalances[m.id] || 0).toFixed(2))
    if (bal > 0.005) creditors.push({ id: m.id, amt: bal })
    else if (bal < -0.005) debtors.push({ id: m.id, amt: -bal }) // store positive owed amount
  }

  if (creditors.length === 0 || debtors.length === 0) return []

  // Sort largest first for greedy pairing
  creditors.sort((a, b) => b.amt - a.amt)
  debtors.sort((a, b) => b.amt - a.amt)

  const plan: SettlementTransaction[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt)
    if (pay > 0.005) {
      plan.push({
        fromMemberId: debtors[i].id,
        toMemberId: creditors[j].id,
        amount: Number(pay.toFixed(2)),
      })
    }

    // Decrease and move pointers
    debtors[i].amt = Number((debtors[i].amt - pay).toFixed(2))
    creditors[j].amt = Number((creditors[j].amt - pay).toFixed(2))

    if (debtors[i].amt <= 0.005) i++
    if (creditors[j].amt <= 0.005) j++
  }

  return plan
}

export function getSettlementPlanSmart(data: AppData, groupId: string): SettlementTransaction[] {
  const group = getGroupById(data, groupId)
  if (!group) return []

  const { memberBalances } = getGroupTotals(data, groupId)

  type Entry = { id: string; amt: number }
  const creditors: Entry[] = []
  const debtors: Entry[] = []

  for (const m of group.members) {
    const bal = Number((memberBalances[m.id] || 0).toFixed(2))
    if (bal > 0.005) creditors.push({ id: m.id, amt: bal })
    else if (bal < -0.005) debtors.push({ id: m.id, amt: -bal })
  }

  if (!creditors.length || !debtors.length) return []

  // 1) Exact-match pass: pair amounts that cancel out exactly to reduce transaction count
  const byAmount = new Map<number, number[]>() // amount -> creditor indices
  creditors.forEach((c, idx) => {
    const key = Number(c.amt.toFixed(2))
    const arr = byAmount.get(key) || []
    arr.push(idx)
    byAmount.set(key, arr)
  })

  const plan: SettlementTransaction[] = []
  const usedCred = new Set<number>()
  const usedDebt = new Set<number>()

  debtors.forEach((d, di) => {
    const key = Number(d.amt.toFixed(2))
    const arr = byAmount.get(key)
    if (arr && arr.length) {
      // use a creditor that hasn't been used yet for this exact match pass
      const ci = arr.find((i) => !usedCred.has(i))
      if (ci !== undefined) {
        usedCred.add(ci)
        usedDebt.add(di)
        plan.push({ fromMemberId: d.id, toMemberId: creditors[ci].id, amount: key })
        creditors[ci].amt = 0
        d.amt = 0
      }
    }
  })

  // Filter remaining
  const remCreditors = creditors.filter((_, i) => !usedCred.has(i)).filter((c) => c.amt > 0.005)
  const remDebtors = debtors.filter((_, i) => !usedDebt.has(i)).filter((d) => d.amt > 0.005)

  // 2) Greedy largest-to-largest to maximize amounts and minimize count
  remCreditors.sort((a, b) => b.amt - a.amt)
  remDebtors.sort((a, b) => b.amt - a.amt)

  let i = 0
  let j = 0
  while (i < remDebtors.length && j < remCreditors.length) {
    // Prefer paying exactly to zero either side if possible among top 3 creditors
    let chosen = j
    const want = Number(remDebtors[i].amt.toFixed(2))
    for (let k = j; k < Math.min(remCreditors.length, j + 3); k++) {
      if (Number(remCreditors[k].amt.toFixed(2)) === want) {
        chosen = k
        break
      }
    }
    if (chosen !== j) {
      // bring chosen creditor to j position
      const tmp = remCreditors[j]
      remCreditors[j] = remCreditors[chosen]
      remCreditors[chosen] = tmp
    }

    const pay = Math.min(remDebtors[i].amt, remCreditors[j].amt)
    if (pay > 0.005) {
      plan.push({
        fromMemberId: remDebtors[i].id,
        toMemberId: remCreditors[j].id,
        amount: Number(pay.toFixed(2)),
      })
    }

    remDebtors[i].amt = Number((remDebtors[i].amt - pay).toFixed(2))
    remCreditors[j].amt = Number((remCreditors[j].amt - pay).toFixed(2))
    if (remDebtors[i].amt <= 0.005) i++
    if (remCreditors[j].amt <= 0.005) j++
  }

  return plan
}
