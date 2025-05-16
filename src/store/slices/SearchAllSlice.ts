import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface TableResult {
  table: string;
  results: any[];
}
interface SearchState {
  query: string;
  results: TableResult[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setResults: (state, action: PayloadAction<TableResult[]>) => {
      state.results = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearSearch: state => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {setQuery, setResults, setLoading, setError, clearSearch} =
  searchSlice.actions;

export const setSearchData = (query: string, results: TableResult[]) => {
  return (dispatch: any) => {
    dispatch(setQuery(query));
    dispatch(setResults(results));
  };
};

export default searchSlice.reducer;
