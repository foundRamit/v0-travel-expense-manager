// Seed data and constants
import type { AppData, Group, Member } from "./types"
import { isoNow } from "./format"

export const CATEGORIES = ["Food", "Accommodation", "Transport", "Activities", "Other"] as const
export const DOCUMENT_TYPES = ["Passport", "Visa", "Ticket", "Booking", "Insurance", "Other"] as const

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

// Pre-seeded demo group and sample content
export function getInitialSeed(): AppData {
  const members: Member[] = [
    { id: id("mem"), name: "Ramit" },
    { id: id("mem"), name: "Sunidhi" },
    { id: id("mem"), name: "Arpit" },
    { id: id("mem"), name: "Deep" },
  ]
  const demoGroup: Group = {
    id: id("grp"),
    name: "Demo Group",
    members,
    description: "Demonstration group for travel expense splitting",
  }

  const today = new Date()
  const d1 = new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString()
  const d2 = new Date(today.getTime() - 1000 * 60 * 60 * 12).toISOString()
  const d3 = isoNow()

  const expenses = [
    {
      id: id("exp"),
      groupId: demoGroup.id,
      amount: 4200, // INR
      category: "Food" as const,
      description: "Dinner at coastal restaurant",
      date: d1,
      paidByMemberId: members[0].id, // Ramit
      splitMemberIds: members.map((m) => m.id),
    },
    {
      id: id("exp"),
      groupId: demoGroup.id,
      amount: 8000,
      category: "Transport" as const,
      description: "Airport taxi (roundtrip)",
      date: d2,
      paidByMemberId: members[2].id, // Arpit
      splitMemberIds: members.map((m) => m.id),
    },
    {
      id: id("exp"),
      groupId: demoGroup.id,
      amount: 12000,
      category: "Accommodation" as const,
      description: "1-night hotel",
      date: d3,
      paidByMemberId: members[1].id, // Sunidhi
      splitMemberIds: members.map((m) => m.id),
    },
  ]

  const docs = [
    {
      id: id("doc"),
      groupId: demoGroup.id,
      title: "Flight Ticket - BLR to GOI",
      type: "Ticket" as const,
      url: "https://example.com/demo-ticket.pdf",
      createdAt: d1,
    },
    {
      id: id("doc"),
      groupId: demoGroup.id,
      title: "Hotel Booking - Seaside Stay",
      type: "Booking" as const,
      url: "https://example.com/demo-booking.pdf",
      createdAt: d2,
      expiryDate: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
  ]

  const activity = [
    { id: id("act"), type: "group" as const, message: `Created group "${demoGroup.name}"`, at: d1 },
    { id: id("act"), type: "expense" as const, message: "Added expense: Dinner at coastal restaurant", at: d1 },
    { id: id("act"), type: "doc" as const, message: "Uploaded document: Flight Ticket - BLR to GOI", at: d1 },
    { id: id("act"), type: "expense" as const, message: "Added expense: Airport taxi (roundtrip)", at: d2 },
    { id: id("act"), type: "doc" as const, message: "Uploaded document: Hotel Booking - Seaside Stay", at: d2 },
    { id: id("act"), type: "expense" as const, message: "Added expense: 1-night hotel", at: d3 },
  ]

  return {
    groups: [demoGroup],
    expenses,
    docs,
    activity,
  }
}
