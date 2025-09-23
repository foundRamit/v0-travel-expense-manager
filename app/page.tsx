// Main page with sidebar navigation and section switching
"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Groups } from "@/components/groups"
import { Expenses } from "@/components/expenses"
import { Documents } from "@/components/documents"
import { Chatbot } from "@/components/chatbot"

type NavKey = "dashboard" | "groups" | "expenses" | "documents" | "chat"

export default function Page() {
  const [nav, setNav] = useState<NavKey>("dashboard")

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as NavKey | undefined
      if (detail) setNav(detail)
    }
    window.addEventListener("switch-nav", handler as EventListener)
    return () => window.removeEventListener("switch-nav", handler as EventListener)
  }, [])

  return (
    <div className="min-h-dvh flex">
      <Sidebar current={nav} onChange={setNav} />
      <section className="flex-1">
        {nav === "dashboard" && <Dashboard />}
        {nav === "groups" && <Groups />}
        {nav === "expenses" && <Expenses />}
        {nav === "documents" && <Documents />}
        {nav === "chat" && <Chatbot />}
      </section>
    </div>
  )
}
