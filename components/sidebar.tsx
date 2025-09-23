"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavKey = "dashboard" | "groups" | "expenses" | "documents" | "chat"

export function Sidebar({
  current,
  onChange,
}: {
  current: NavKey
  onChange: (key: NavKey) => void
}) {
  const items: { key: NavKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "groups", label: "Groups" },
    { key: "expenses", label: "Expenses" },
    { key: "documents", label: "Documents" },
    { key: "chat", label: "AI Chat" },
  ]
  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-900">Travel MVP</h2>
        <p className="text-sm text-slate-600">Group travel management</p>
      </div>
      <nav className="p-2 flex flex-col gap-2">
        {items.map((it) => (
          <Button
            key={it.key}
            variant={current === it.key ? "default" : "ghost"}
            className={cn(
              "justify-start",
              current === it.key ? "bg-sky-600 hover:bg-sky-700 text-white" : "text-slate-800",
            )}
            onClick={() => onChange(it.key)}
          >
            {it.label}
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4 text-xs text-slate-500">Currency: INR (₹)</div>
    </aside>
  )
}
