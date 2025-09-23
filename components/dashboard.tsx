"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppData } from "@/hooks/use-app-data"
import { formatINR } from "@/lib/format"
import { getGroupTotals, getRecentActivity } from "@/lib/calculations"

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
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm text-balance">Travel Splitter</h1>
        <div className="hidden md:flex items-center gap-3">
          <button
            className="pill-ghost px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "groups" }))}
          >
            Groups
          </button>
          <button
            className="pill-ghost px-4 py-2 text-sm font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-nav", { detail: "documents" }))}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white/90">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatINR(totals.total)}</div>
            <p className="text-sm text-white/80">Across all groups</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white/90">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.groups.length}</div>
            <p className="text-sm text-white/80">Manage members and roles</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white/90">Documents Stored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.docs.length}</div>
            <p className="text-sm text-white/80">Tickets, bookings, etc.</p>
          </CardContent>
        </Card>
      </section>

      {/* Group details */}
      {firstGroup && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white/90">{firstGroup.name}: By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm">
                {Object.entries(totals.byCategory).map(([cat, amt]) => (
                  <li key={cat} className="flex items-center justify-between py-1">
                    <span className="text-white/90">{cat}</span>
                    <span className="font-medium text-white">{formatINR(amt)}</span>
                  </li>
                ))}
                {Object.keys(totals.byCategory).length === 0 && <li className="text-white/80">No expenses yet.</li>}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white/90">{firstGroup.name}: Per-Person Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm">
                {firstGroup.members.map((m) => {
                  const bal = totals.memberBalances[m.id] || 0
                  return (
                    <li key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-white/90">{m.name}</span>
                      <span className={bal >= 0 ? "text-emerald-200 font-medium" : "text-white font-medium"}>
                        {bal >= 0 ? `Owed ${formatINR(bal)}` : `Owes ${formatINR(Math.abs(bal))}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white/90">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {recent.map((a) => (
                <li key={a.id} className="py-1 flex items-center justify-between">
                  <span className="text-white/90">{a.message}</span>
                  <time className="text-white/70">{new Date(a.at).toLocaleString()}</time>
                </li>
              ))}
              {recent.length === 0 && <li className="text-white/80">No recent activity.</li>}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Get started CTA */}
      <section className="glass p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Get started</h2>
        <p className="text-white/85 mb-4">Create a group, add members, then record expenses.</p>
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
