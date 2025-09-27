import type { ExpenseCategory } from "./types"

const KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: ["food", "lunch", "dinner", "breakfast", "snack", "meal", "cafe", "restaurant", "chai", "coffee"],
  Accommodation: ["hotel", "hostel", "stay", "room", "airbnb", "lodge", "accommodation"],
  Transport: [
    "taxi",
    "uber",
    "ola",
    "cab",
    "bus",
    "train",
    "flight",
    "airfare",
    "fuel",
    "petrol",
    "diesel",
    "transport",
  ],
  Activities: ["ticket", "museum", "park", "activity", "boat", "tour", "guide", "hike", "temple", "fort", "entry"],
  Other: ["shopping", "gift", "souvenir", "misc", "other"],
}

export type CategorySuggestion = {
  category: ExpenseCategory
  score: number
  matched: string[]
}

/**
 * Suggest a category from description using simple keyword scoring.
 * Structured so we can swap in an ML model later without changing callers.
 */
export function suggestCategory(description: string): CategorySuggestion {
  const text = (description || "").toLowerCase()
  let best: CategorySuggestion = { category: "Other", score: 0, matched: [] }(
    Object.keys(KEYWORDS) as ExpenseCategory[],
  ).forEach((cat) => {
    const words = KEYWORDS[cat]
    const found = words.filter((w) => text.includes(w))
    const score = found.length
    if (score > best.score) {
      best = { category: cat, score, matched: found }
    }
  })

  return best
}
