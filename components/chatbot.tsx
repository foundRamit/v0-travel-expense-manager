"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/hooks/use-app-data"
import { formatINR } from "@/lib/format"
import { getGroupTotals, getSettlementPlanSmart } from "@/lib/calculations"
import { predictTotalForGroup } from "@/lib/forecast"

type ChatMsg = { role: "user" | "assistant"; text: string; at: string }

function answer(query: string, ctx: ReturnType<typeof useAppData>["data"]) {
  const q = query.toLowerCase()
  if (!ctx) return "I couldn't access data. Please try again."

  const group = ctx.groups[0]
  const totals = group
    ? getGroupTotals(ctx, group.id)
    : { total: 0, byCategory: {}, memberBalances: {} as Record<string, number> }

  // Hardcoded intents
  if (q.includes("total") || q.includes("summary") || q.includes("overall")) {
    const lines = [`Overall total: ${formatINR(totals.total)}.`]
    if (group) {
      lines.push(`Group considered: ${group.name}.`)
      const parts = Object.entries(totals.byCategory).map(([c, v]) => `${c}: ${formatINR(v)}`)
      if (parts.length) lines.push(`By category — ${parts.join(", ")}.`)
      lines.push(`Forecast total: ${formatINR(predictTotalForGroup(ctx, group.id))}.`)
    }
    return lines.join(" ")
  }

  if (q.includes("per person") || q.includes("each") || q.includes("split") || q.includes("balance")) {
    if (group) {
      const members = group.members.map((m) => {
        const bal = totals.memberBalances[m.id] || 0
        return `${m.name}: ${bal >= 0 ? `owed ${formatINR(bal)}` : `owes ${formatINR(Math.abs(bal))}`}`
      })
      return `Per-person balances for ${group.name}: ${members.join("; ")}.`
    }
    return "No group found."
  }

  if (q.includes("members") || q.includes("who is in the group") || q.includes("group")) {
    if (group) {
      return `Members in ${group.name}: ${group.members.map((m) => m.name).join(", ")}.`
    }
    return "No group found."
  }

  if (q.includes("add expense") || q.includes("how to add")) {
    return "To add an expense: go to Expenses -> fill in Group, Category, Amount (₹), Description, choose Paid By, select members to split with, then click Add Expense. Splits are equal among selected members."
  }

  if (q.includes("document") || q.includes("upload")) {
    return "To add a document: go to Documents -> choose Group, enter Title and Type, paste URL if available, set optional Expiry, then click Save."
  }

  if (q.includes("inr") || q.includes("currency")) {
    return "All amounts are in INR (₹) using Indian numbering format."
  }

  // Settlement/minimum transactions intent
  if (q.includes("settle") || q.includes("simplify") || q.includes("minimum") || q.includes("transactions")) {
    if (!group) return "No group found."
    const plan = getSettlementPlanSmart(ctx, group.id)
    if (plan.length === 0) return `No settlements needed for ${group.name}. Everyone is even.`
    const lines = plan.map((t) => {
      const from = group.members.find((m) => m.id === t.fromMemberId)?.name ?? "Member"
      const to = group.members.find((m) => m.id === t.toMemberId)?.name ?? "Member"
      return `${from} pays ${to} ${formatINR(t.amount)}`
    })
    return `Optimized settlement (fewer, higher-value payments) for ${group.name}: ${lines.join("; ")}.`
  }

  return "I can help with totals, per-person balances, group members, how to add expenses or documents, currency info, and settlements. Try: 'Show per person balance' or 'Total summary'."
}

export function Chatbot() {
  const store = useAppData()
  const { data } = store
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hi! I’m your travel assistant. Ask me for a total summary, per-person balances, or how to add expenses/documents.",
      at: new Date().toISOString(),
    },
    {
      role: "assistant",
      text: "Demo Group is preloaded with members: Ramit, Sunidhi, Arpit, Deep, and sample expenses in INR.",
      at: new Date().toISOString(),
    },
  ])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMsg = { role: "user", text: input.trim(), at: new Date().toISOString() }
    const replyText = answer(input, data)
    const botMsg: ChatMsg = { role: "assistant", text: replyText, at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput("")
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-balance">AI Chat (Hardcoded)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ask about expenses, balances, or how to use the app</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="border rounded-md p-3 h-80 overflow-auto bg-white">
            <ul className="space-y-3">
              {messages.map((m, idx) => (
                <li key={idx} className={m.role === "assistant" ? "text-slate-800" : "text-slate-900"}>
                  <span className="text-xs text-slate-500 block mb-1">
                    {m.role === "assistant" ? "Assistant" : "You"}
                  </span>
                  <p className="text-sm">{m.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Show per person balance"
              aria-label="Chat input"
            />
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleSend}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
