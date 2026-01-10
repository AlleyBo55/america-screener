/**
 * Token Detail Slice
 * 
 * Redux slice for selected token and analysis data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenPair } from '@/types/token';
import { RugCheckReport } from '@/lib/services/rugcheckService';
import { HolderDistribution } from '@/lib/services/solanafmService';

interface TokenDetailState {
    selectedToken: TokenPair | null;
    isOpen: boolean;

    // Analysis data
    rugCheckData: RugCheckReport | null;
    holderData: HolderDistribution | null;
    isLoadingAnalysis: boolean;
    analysisError: string | null;
}

const initialState: TokenDetailState = {
    selectedToken: null,
    isOpen: false,
    rugCheckData: null,
    holderData: null,
    isLoadingAnalysis: false,
    analysisError: null,
};

const tokenDetailSlice = createSlice({
    name: 'tokenDetail',
    initialState,
    reducers: {
        // Select token and open modal
        selectToken(state, action: PayloadAction<TokenPair>) {
            state.selectedToken = action.payload;
            state.isOpen = true;
            state.rugCheckData = null;
            state.holderData = null;
            state.isLoadingAnalysis = true;
            state.analysisError = null;
        },

        // Close modal and clear selection
        closeTokenDetail(state) {
            state.isOpen = false;
            state.selectedToken = null;
            state.rugCheckData = null;
            state.holderData = null;
        },

        // Analysis fetch actions
        fetchAnalysisRequest(state) {
            state.isLoadingAnalysis = true;
            state.analysisError = null;
        },
        fetchAnalysisSuccess(
            state,
            action: PayloadAction<{ rugCheck: RugCheckReport | null; holders: HolderDistribution | null }>
        ) {
            state.rugCheckData = action.payload.rugCheck;
            state.holderData = action.payload.holders;
            state.isLoadingAnalysis = false;
        },
        fetchAnalysisFailure(state, action: PayloadAction<string>) {
            state.isLoadingAnalysis = false;
            state.analysisError = action.payload;
        },
    },
});

export const {
    selectToken,
    closeTokenDetail,
    fetchAnalysisRequest,
    fetchAnalysisSuccess,
    fetchAnalysisFailure,
} = tokenDetailSlice.actions;

export default tokenDetailSlice.reducer;

// Selectors
export const selectSelectedToken = (state: { tokenDetail: TokenDetailState }) => state.tokenDetail.selectedToken;
export const selectIsOpen = (state: { tokenDetail: TokenDetailState }) => state.tokenDetail.isOpen;
export const selectRugCheckData = (state: { tokenDetail: TokenDetailState }) => state.tokenDetail.rugCheckData;
export const selectHolderData = (state: { tokenDetail: TokenDetailState }) => state.tokenDetail.holderData;
export const selectIsLoadingAnalysis = (state: { tokenDetail: TokenDetailState }) => state.tokenDetail.isLoadingAnalysis;
