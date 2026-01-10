/**
 * Token Saga
 * 
 * Handles async operations for token list fetching
 */

import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { getAmericaFunTokens } from '@/lib/services/dexscreenerService';
import { TokenPair } from '@/types/token';
import {
    fetchTokensRequest,
    fetchTokensSuccess,
    fetchTokensFailure,
    refreshTokensRequest,
} from '@/store/slices/tokenSlice';

/**
 * Worker saga: fetch tokens
 */
function* fetchTokensWorker(): Generator {
    try {
        const tokens = (yield call(getAmericaFunTokens)) as TokenPair[];
        yield put(fetchTokensSuccess(tokens));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch tokens';
        yield put(fetchTokensFailure(message));
    }
}

/**
 * Worker saga: refresh tokens with debounce
 */
function* refreshTokensWorker(): Generator {
    // Small delay to prevent rapid refreshes
    yield delay(300);
    yield call(fetchTokensWorker);
}

/**
 * Watcher sagas
 */
export function* watchFetchTokens(): Generator {
    yield takeLatest(fetchTokensRequest.type, fetchTokensWorker);
}

export function* watchRefreshTokens(): Generator {
    yield takeLatest(refreshTokensRequest.type, refreshTokensWorker);
}
