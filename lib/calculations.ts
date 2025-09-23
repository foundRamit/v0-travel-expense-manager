// Expense calculations and summaries
import type { AppData, Group } from "./types"

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
