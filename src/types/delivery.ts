export interface Delivery {
  id: string;
  date: string; // YYYY-MM-DD
  client: string;
  departureLocation: string;
  destination: string;
  goods: string;
  weightKg: number;
  pricePerKg: number;
  totalAriary: number;
}

// Used for AI suggestion display, not stored with Delivery
export interface AISuggestion {
  suggestedPricePerKg?: number;
  reasoning?: string;
}
