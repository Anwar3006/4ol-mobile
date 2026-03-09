import { create } from "zustand";

interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  error: any;
  setSearchData: (query: string, results: any[]) => void;
  setError: (error: any) => void;
  setLoading: (isLoading: boolean) => void;
}

const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  error: null,
  setSearchData: (query, results) => set({ query, results, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useSearchStore;
