// LocalStorage-backed app data store using SWR
import useSWR from "swr"
import type { AppData, Doc, Expense, Group } from "@/lib/types"
import { getInitialSeed } from "@/lib/data"
import { isoNow } from "@/lib/format"

const STORAGE_KEY = "travel_mvp_data_v1"

function load(): AppData {
  if (typeof window === "undefined") return getInitialSeed()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = getInitialSeed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
  try {
    return JSON.parse(raw) as AppData
  } catch {
    const seed = getInitialSeed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

function save(data: AppData) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useAppData() {
  const { data, mutate } = useSWR<AppData>("app-data", load, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  function update(updater: (prev: AppData) => AppData) {
    if (!data) return
    const next = updater(data)
    save(next)
    mutate(next, false)
  }

  return {
    data,
    addGroup(group: Group) {
      update((prev) => ({
        ...prev,
        groups: [...prev.groups, group],
        activity: [
          { id: crypto.randomUUID(), type: "group", message: `Created group "${group.name}"`, at: isoNow() },
          ...prev.activity,
        ],
      }))
    },
    addExpense(expense: Expense) {
      update((prev) => ({
        ...prev,
        expenses: [expense, ...prev.expenses],
        activity: [
          { id: crypto.randomUUID(), type: "expense", message: `Added expense: ${expense.description}`, at: isoNow() },
          ...prev.activity,
        ],
      }))
    },
    addDoc(doc: Doc) {
      update((prev) => ({
        ...prev,
        docs: [doc, ...prev.docs],
        activity: [
          { id: crypto.randomUUID(), type: "doc", message: `Uploaded document: ${doc.title}`, at: isoNow() },
          ...prev.activity,
        ],
      }))
    },
    removeGroup(groupId: string) {
      update((prev) => {
        const group = prev.groups.find((g) => g.id === groupId)
        return {
          ...prev,
          groups: prev.groups.filter((g) => g.id !== groupId),
          expenses: prev.expenses.filter((e) => e.groupId !== groupId),
          docs: prev.docs.filter((d) => d.groupId !== groupId),
          activity: [
            {
              id: crypto.randomUUID(),
              type: "group",
              message: `Deleted group "${group?.name ?? "Group"}"`,
              at: isoNow(),
            },
            ...prev.activity,
          ],
        }
      })
    },
  }
}
