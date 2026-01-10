/**
 * Token Detail Saga
 * 
 * Handles async operations for token analysis fetching
 */

import { call, put, takeLatest, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { TokenPair } from '@/types/token';
import { getRugCheckReport, RugCheckReport } from '@/lib/services/rugcheckService';
import { getHolderDistribution, HolderDistribution } from '@/lib/services/solanafmService';
import {
    selectToken,
    fetchAnalysisSuccess,
    fetchAnalysisFailure,
} from '@/store/slices/tokenDetailSlice';

/**
 * Worker saga: fetch analysis data when token is selected
 */
function* fetchAnalysisWorker(action: PayloadAction<TokenPair>): Generator {
    try {
        const tokenAddress = action.payload.baseToken.address;

        // Fetch both APIs in parallel
        const [rugCheck, holders] = (yield all([
            call(getRugCheckReport, tokenAddress),
            call(getHolderDistribution, tokenAddress),
        ])) as [RugCheckReport | null, HolderDistribution | null];

        yield put(fetchAnalysisSuccess({ rugCheck, holders }));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch analysis';
        yield put(fetchAnalysisFailure(message));
    }
}

/**
 * Watcher saga
 */
export function* watchSelectToken(): Generator {
    yield takeLatest(selectToken.type, fetchAnalysisWorker);
}
