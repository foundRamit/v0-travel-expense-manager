"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppData } from "@/hooks/use-app-data"
import { CATEGORIES } from "@/lib/data"
import type { Expense } from "@/lib/types"
import { formatINR } from "@/lib/format"
import { getGroupTotals } from "@/lib/calculations"
import { suggestCategory } from "@/lib/nlp"

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function Expenses() {
  const { data, addExpense } = useAppData()
  const [groupId, setGroupId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [category, setCategory] = useState<string>("Food")
  const [userChangedCategory, setUserChangedCategory] = useState(false) // track manual override
  const [paidBy, setPaidBy] = useState<string>("")
  const [splitWith, setSplitWith] = useState<string[]>([])

  const selectedGroup = useMemo(() => data?.groups.find((g) => g.id === groupId) || data?.groups[0], [data, groupId])

  const memberOptions = selectedGroup?.members ?? []
  const validPaidBy = paidBy && memberOptions.some((m) => m.id === paidBy) ? paidBy : memberOptions[0]?.id
  const validSplitWith = splitWith.length
    ? splitWith.filter((id) => memberOptions.some((m) => m.id === id))
    : memberOptions.map((m) => m.id)

  const totals = selectedGroup
    ? getGroupTotals(data, selectedGroup.id)
    : { total: 0, byCategory: {}, memberBalances: {} }

  if (!data) return null

  function toggleSplit(id: string) {
    setSplitWith((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function onDescriptionChange(text: string) {
    setDescription(text)
    if (!userChangedCategory) {
      const suggestion = suggestCategory(text)
      if (suggestion.score > 0) {
        setCategory(suggestion.category)
      }
    }
  }

  function handleAdd() {
    if (!selectedGroup || !amount || Number.isNaN(Number(amount)) || !validPaidBy || validSplitWith.length === 0) return
    const exp: Expense = {
      id: newId("exp"),
      groupId: selectedGroup.id,
      amount: Number(amount),
      category: category as any,
      description: description || "Expense",
      date: new Date().toISOString(),
      paidByMemberId: validPaidBy,
      splitMemberIds: validSplitWith,
    }
    addExpense(exp)
    setDescription("")
    setAmount("")
    setUserChangedCategory(false) // reset user override after adding expense
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-balance">Expenses</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Expense (INR)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Group</span>
              <Select value={selectedGroup?.id} onValueChange={setGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {data.groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Category</span>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v)
                  setUserChangedCategory(true) // user override
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Amount (₹)</span>
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 1500"
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Description</span>
            <Input
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)} // hook in suggestion
              placeholder="e.g., Lunch at cafe"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Paid By</span>
              <Select value={validPaidBy} onValueChange={setPaidBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="grid gap-2">
              <span className="text-sm text-slate-700">Split Between</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {memberOptions.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox checked={validSplitWith.includes(m.id)} onCheckedChange={() => toggleSplit(m.id)} />
                    {m.name}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">Equal split across selected members.</p>
            </div>
          </div>

          <div>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleAdd}>
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedGroup && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedGroup.name} — Running Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(totals.total)}</div>
              <ul className="mt-4 text-sm">
                {Object.entries(totals.byCategory).map(([cat, amt]) => (
                  <li key={cat} className="flex items-center justify-between py-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-medium">{formatINR(amt)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedGroup.name} — Per-Person</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm">
                {selectedGroup.members.map((m) => {
                  const bal = totals.memberBalances[m.id] || 0
                  return (
                    <li key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-slate-700">{m.name}</span>
                      <span className={bal >= 0 ? "text-emerald-600 font-medium" : "text-slate-800 font-medium"}>
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

      <section className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>All Expenses (Latest First)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 font-medium text-slate-700">
                <div>Description</div>
                <div>Group</div>
                <div className="hidden md:block">Category</div>
                <div className="hidden md:block">Paid By</div>
                <div>Amount</div>
                <div className="hidden md:block">Date</div>
              </div>
              <div className="mt-2 space-y-2">
                {data.expenses.map((e) => {
                  const g = data.groups.find((x) => x.id === e.groupId)
                  const payer = g?.members.find((m) => m.id === e.paidByMemberId)
                  return (
                    <div key={e.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 py-2 border-b border-slate-100">
                      <div className="text-slate-800">{e.description}</div>
                      <div className="text-slate-700">{g?.name}</div>
                      <div className="hidden md:block">{e.category}</div>
                      <div className="hidden md:block">{payer?.name}</div>
                      <div className="font-medium">{formatINR(e.amount)}</div>
                      <div className="hidden md:block">{new Date(e.date).toLocaleString()}</div>
                    </div>
                  )
                })}
                {data.expenses.length === 0 && <div className="text-slate-600">No expenses added yet.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
