/**
 * Token Slice
 * 
 * Redux slice for token list state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenPair, SortKey, SortDirection } from '@/types/token';

interface TokenState {
    tokens: TokenPair[];
    isLoading: boolean;
    error: string | null;
    lastFetchedAt: number | null;

    // Pagination
    page: number;
    pageSize: number;

    // Sorting
    sortKey: SortKey;
    sortDirection: SortDirection;

    // Filtering
    searchQuery: string;
}

const initialState: TokenState = {
    tokens: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    page: 1,
    pageSize: 20,
    sortKey: 'age',
    sortDirection: 'asc',
    searchQuery: '',
};

const tokenSlice = createSlice({
    name: 'tokens',
    initialState,
    reducers: {
        // Fetch actions
        fetchTokensRequest(state) {
            state.isLoading = true;
            state.error = null;
        },
        fetchTokensSuccess(state, action: PayloadAction<TokenPair[]>) {
            state.tokens = action.payload;
            state.isLoading = false;
            state.lastFetchedAt = Date.now();
        },
        fetchTokensFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Refresh action
        refreshTokensRequest(state) {
            state.isLoading = true;
            state.error = null;
        },

        // Pagination
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
            state.page = 1; // Reset to first page
        },

        // Sorting
        setSortKey(state, action: PayloadAction<SortKey>) {
            if (state.sortKey === action.payload) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortKey = action.payload;
                state.sortDirection = 'desc';
            }
        },

        // Filtering
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
            state.page = 1; // Reset to first page
        },
    },
});

export const {
    fetchTokensRequest,
    fetchTokensSuccess,
    fetchTokensFailure,
    refreshTokensRequest,
    setPage,
    setPageSize,
    setSortKey,
    setSearchQuery,
} = tokenSlice.actions;

export default tokenSlice.reducer;

// Selectors
export const selectTokens = (state: { tokens: TokenState }) => state.tokens.tokens;
export const selectIsLoading = (state: { tokens: TokenState }) => state.tokens.isLoading;
export const selectError = (state: { tokens: TokenState }) => state.tokens.error;
export const selectPage = (state: { tokens: TokenState }) => state.tokens.page;
export const selectPageSize = (state: { tokens: TokenState }) => state.tokens.pageSize;
export const selectSortKey = (state: { tokens: TokenState }) => state.tokens.sortKey;
export const selectSortDirection = (state: { tokens: TokenState }) => state.tokens.sortDirection;
export const selectSearchQuery = (state: { tokens: TokenState }) => state.tokens.searchQuery;
