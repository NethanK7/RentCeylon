import { create } from 'zustand'

interface SearchFilters {
  query: string
  categorySlug: string
  location: string
  minPrice: number | null
  maxPrice: number | null
  startDate: string
  endDate: string
  sortBy: 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

interface ListingsStore {
  filters: SearchFilters
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categorySlug: '',
  location: '',
  minPrice: null,
  maxPrice: null,
  startDate: '',
  endDate: '',
  sortBy: 'newest',
}

export const useListingsStore = create<ListingsStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}))
