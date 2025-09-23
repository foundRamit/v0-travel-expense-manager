"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/hooks/use-app-data"
import type { Group, Member } from "@/lib/types"

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function Groups() {
  const { data, addGroup } = useAppData()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [members, setMembers] = useState<string>("")

  if (!data) return null

  function handleCreate() {
    if (!name.trim()) return
    const memberNames = members
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const mems: Member[] = memberNames.map((n) => ({ id: newId("mem"), name: n }))
    const group: Group = {
      id: newId("grp"),
      name: name.trim(),
      members: mems,
      description: description.trim() || undefined,
    }
    addGroup(group)
    setName("")
    setDescription("")
    setMembers("")
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-balance">Groups</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Group</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Group Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Goa Trip" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Description (optional)</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Members (comma separated)</span>
            <Input
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="e.g., Aditi, Karan, Nisha"
            />
          </label>
          <div>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.groups.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {g.description && <p className="text-slate-700 mb-2">{g.description}</p>}
              <p className="text-slate-700 font-medium mb-1">Members</p>
              <ul className="text-slate-700 list-disc pl-5">
                {g.members.map((m) => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
