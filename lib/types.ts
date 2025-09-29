// Types for the MVP app

export type Member = {
  id: string
  name: string
}

export type Group = {
  id: string
  name: string
  members: Member[]
  description?: string
  startDate?: string // ISO yyyy-mm-dd
  endDate?: string // ISO yyyy-mm-dd
}

export type ExpenseCategory = "Food" | "Accommodation" | "Transport" | "Activities" | "Other"

export type Expense = {
  id: string
  groupId: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string // ISO
  paidByMemberId: string
  splitMemberIds: string[]
}

export type DocumentType = "Passport" | "Visa" | "Ticket" | "Booking" | "Insurance" | "Other"

export type Doc = {
  id: string
  groupId: string
  title: string
  type: DocumentType
  url?: string
  expiryDate?: string // ISO
  createdAt: string // ISO
}

export type SettlementTransaction = {
  fromMemberId: string
  toMemberId: string
  amount: number
}

export type AppData = {
  groups: Group[]
  expenses: Expense[]
  docs: Doc[]
  activity: { id: string; type: "group" | "expense" | "doc"; message: string; at: string }[]
}
