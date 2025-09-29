import type { ExpenseCategory } from "@/lib/types"

const FOOD_KEYWORDS = [
  "pizza",
  "burger",
  "sushi",
  "dinner",
  "lunch",
  "breakfast",
  "coffee",
  "cafe",
  "caf\u00e9",
  "restaurant",
  "meal",
  "snack",
  "bar",
  "beer",
  "wine",
  "drink",
  "drinks",
  "cocktail",
  "bistro",
  "eatery",
  "bakery",
  "deli",
  "ramen",
  "taco",
  "noodle",
  "steak",
  "salad",
  "dessert",
  "ice cream",
]

// IMPORTANT: Check specific phrases before broad providers
const FOOD_SPECIALS = ["uber eats", "ubereats", "doordash", "grubhub", "deliveroo"]

const ACCOMMODATION_KEYWORDS = [
  "hotel",
  "hostel",
  "airbnb",
  "motel",
  "inn",
  "lodging",
  "accommodation",
  "stay",
  "bnb",
  "guesthouse",
  "resort",
]

const TRANSPORT_KEYWORDS = [
  "uber",
  "lyft",
  "taxi",
  "cab",
  "train",
  "bus",
  "metro",
  "subway",
  "tram",
  "flight",
  "airline",
  "plane",
  "ferry",
  "boat",
  "uberx",
  "uberxl",
  "parking",
  "toll",
  "fuel",
  "gas",
  "petrol",
  "diesel",
  "rental car",
  "car rental",
  "car-hire",
  "scooter",
  "bike",
  "bicycle",
  "rideshare",
]

const ACTIVITIES_KEYWORDS = [
  "museum",
  "tour",
  "ticket",
  "tickets",
  "zoo",
  "park",
  "excursion",
  "activity",
  "activities",
  "ski",
  "hike",
  "diving",
  "snorkeling",
  "amusement",
  "theme park",
  "show",
  "concert",
  "boat tour",
  "guided tour",
  "attraction",
  "entry",
  "pass",
]

function includesAny(text: string, list: string[]) {
  const t = text.toLowerCase()
  return list.some((k) => t.includes(k))
}

export function categorizeExpense(description: string): ExpenseCategory {
  const d = description.toLowerCase().trim()

  // Specific phrases first to avoid misclassification
  if (includesAny(d, FOOD_SPECIALS)) return "Food"

  if (includesAny(d, FOOD_KEYWORDS)) return "Food"
  if (includesAny(d, ACCOMMODATION_KEYWORDS)) return "Accommodation"
  if (includesAny(d, TRANSPORT_KEYWORDS)) return "Transport"
  if (includesAny(d, ACTIVITIES_KEYWORDS)) return "Activities"

  return "Other"
}
