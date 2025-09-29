"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppData } from "@/hooks/use-app-data"
import { DOCUMENT_TYPES } from "@/lib/data"
import type { Doc } from "@/lib/types"

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function Documents() {
  const { data, addDoc, removeDoc } = useAppData()
  const [groupId, setGroupId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<string>("Ticket")
  const [url, setUrl] = useState("")
  const [expiry, setExpiry] = useState("")

  const selectedGroup = useMemo(() => data?.groups.find((g) => g.id === groupId) || data?.groups[0], [data, groupId])

  if (!data) return null

  function handleAdd() {
    if (!selectedGroup || !title.trim()) return
    const doc: Doc = {
      id: newId("doc"),
      groupId: selectedGroup.id,
      title: title.trim(),
      type: type as any,
      url: url.trim() || undefined,
      createdAt: new Date().toISOString(),
      expiryDate: expiry ? new Date(expiry).toISOString() : undefined,
    }
    addDoc(doc)
    setTitle("")
    setUrl("")
    setExpiry("")
  }

  function handleDelete(id: string) {
    if (confirm("Delete this document? This cannot be undone.")) {
      removeDoc(id)
    }
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-balance">Documents</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Document</CardTitle>
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
              <span className="text-sm text-slate-700">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Train Ticket" />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Type</span>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Google Drive URL (optional)</span>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
              />
              <span className="text-xs text-slate-500">Paste a Google Drive link to the file or folder.</span>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-700">Expiry Date (optional)</span>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </label>
          </div>

          <div>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleAdd}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 font-medium text-slate-700">
                <div>Title</div>
                <div>Group</div>
                <div className="hidden md:block">Type</div>
                <div className="hidden md:block">Expiry</div>
                <div>Created</div>
                <div className="hidden md:block text-right">Actions</div>
              </div>
              <div className="mt-2 space-y-2">
                {data.docs.map((d) => {
                  const g = data.groups.find((x) => x.id === d.groupId)
                  return (
                    <div key={d.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 py-2 border-b border-slate-100">
                      <div className="text-slate-800">
                        {d.url ? (
                          <a href={d.url} className="text-sky-700 underline" target="_blank" rel="noreferrer">
                            {d.title}
                          </a>
                        ) : (
                          d.title
                        )}
                      </div>
                      <div className="text-slate-700">{g?.name}</div>
                      <div className="hidden md:block">{d.type}</div>
                      <div className="hidden md:block">
                        {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "-"}
                      </div>
                      <div>{new Date(d.createdAt).toLocaleDateString()}</div>
                      <div className="hidden md:flex items-center justify-end gap-2">
                        {d.url && (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Open
                          </a>
                        )}
                        <Button
                          variant="destructive"
                          className="text-xs px-2 py-1 h-7"
                          onClick={() => handleDelete(d.id)}
                        >
                          Delete
                        </Button>
                      </div>
                      {/* Mobile actions */}
                      <div className="md:hidden col-span-2 flex items-center justify-start gap-2">
                        {d.url && (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Open
                          </a>
                        )}
                        <Button
                          variant="destructive"
                          className="text-xs px-2 py-1 h-7"
                          onClick={() => handleDelete(d.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {data.docs.length === 0 && <div className="text-slate-600">No documents yet.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
