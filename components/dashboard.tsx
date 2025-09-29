"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppData } from "@/hooks/use-app-data"
import { formatINR } from "@/lib/format"
import { getGroupTotals, getRecentActivity, getSettlementPlanSmart } from "@/lib/calculations"
import { predictTotalForGroup } from "@/lib/forecast"

export function Dashboard() {
  const { data } = useAppData()
  if (!data) return null

  const firstGroup = data.groups[0]
  const totals = firstGroup ? getGroupTotals(data, firstGroup.id) : { total: 0, byCategory: {}, memberBalances: {} }
  const recent = getRecentActivity(data, 6)

  return (
    <main className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-black text-balance ascii-title">TripSplit</h1>
        <div className="hidden md:flex items-center gap-3">
          <button
            className="pill-ghost px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "groups" }))}
          >
            <span className="ascii-chip">Groups</span>
          </button>
          <button
            className="pill-ghost px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "documents" }))}
          >
            <span className="ascii-chip">Documents</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass ascii-border">
          <CardHeader>
            <CardTitle className="text-black ascii-title">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{formatINR(totals.total)}</div>
            <p className="text-sm text-black/80">Across all groups</p>
          </CardContent>
        </Card>

        <Card className="glass ascii-border">
          <CardHeader>
            <CardTitle className="text-black ascii-title">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{data.groups.length}</div>
            <p className="text-sm text-black/80">Manage members and roles</p>
          </CardContent>
        </Card>

        <Card className="glass ascii-border">
          <CardHeader>
            <CardTitle className="text-black ascii-title">Documents Stored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{data.docs.length}</div>
            <p className="text-sm text-black/80">Tickets, bookings, etc.</p>
          </CardContent>
        </Card>
      </section>

      {/* Group details */}
      {firstGroup && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass ascii-border">
            <CardHeader>
              <CardTitle className="text-black ascii-title">{firstGroup.name}: By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm">
                {Object.entries(totals.byCategory).map(([cat, amt]) => (
                  <li key={cat} className="flex items-center justify-between py-1">
                    <span className="text-black/90">{cat}</span>
                    <span className="font-medium text-black">{formatINR(amt)}</span>
                  </li>
                ))}
                {Object.keys(totals.byCategory).length === 0 && <li className="text-black/80">No expenses yet.</li>}
              </ul>
              {/* forecast total */}
              <p className="text-black/80 text-sm mt-3">
                Forecast total: {formatINR(predictTotalForGroup(data, firstGroup.id))}
              </p>
            </CardContent>
          </Card>

          <Card className="glass ascii-border">
            <CardHeader>
              <CardTitle className="text-black ascii-title">{firstGroup.name}: Per-Person Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm">
                {firstGroup.members.map((m) => {
                  const bal = totals.memberBalances[m.id] || 0
                  return (
                    <li key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-black/90">{m.name}</span>
                      <span className="text-black font-medium">
                        {bal >= 0 ? `Owed ${formatINR(bal)}` : `Owes ${formatINR(Math.abs(bal))}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {/* settlement recommendation */}
              {(() => {
                const plan = getSettlementPlanSmart(data, firstGroup.id)
                if (!plan.length) {
                  return <p className="text-black/80 text-sm mt-3">No settlements needed.</p>
                }
                return (
                  <div className="mt-3">
                    <p className="text-black/80 text-sm mb-1">Recommended settlement (min transactions):</p>
                    <ul className="text-sm space-y-1">
                      {plan.map((t, idx) => {
                        const from = firstGroup.members.find((m) => m.id === t.fromMemberId)?.name ?? "Member"
                        const to = firstGroup.members.find((m) => m.id === t.toMemberId)?.name ?? "Member"
                        return (
                          <li key={idx} className="text-black">
                            {from} pays {to} {formatINR(t.amount)}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <Card className="glass ascii-border">
          <CardHeader>
            <CardTitle className="text-black ascii-title">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {recent.map((a) => (
                <li key={a.id} className="py-1 flex items-center justify-between">
                  <span className="text-black/90">{a.message}</span>
                  <time className="text-black/70">{new Date(a.at).toLocaleString()}</time>
                </li>
              ))}
              {recent.length === 0 && <li className="text-black/80">No recent activity.</li>}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Get started CTA */}
      <section className="glass ascii-border p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold text-black mb-2 ascii-title">Get started</h2>
        {/* optional divider for subtle ASCII feel */}
        <div className="ascii-divider mb-3"></div>
        <p className="text-black/85 mb-4">Create a group, add members, then record expenses.</p>
        <div className="flex items-center gap-3">
          <button
            className="pill-green px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "groups" }))}
          >
            Create a Group
          </button>
          <button
            className="pill-blue px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "documents" }))}
          >
            Upload Documents
          </button>
        </div>
      </section>
    </main>
  )
}
