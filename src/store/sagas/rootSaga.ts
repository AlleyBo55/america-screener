/**
 * Root Saga
 * 
 * Combines all sagas into one entry point
 */

import { all, fork } from 'redux-saga/effects';
import { watchFetchTokens, watchRefreshTokens } from './tokenSaga';
import { watchSelectToken } from './tokenDetailSaga';

export default function* rootSaga(): Generator {
    yield all([
        fork(watchFetchTokens),
        fork(watchRefreshTokens),
        fork(watchSelectToken),
    ]);
}
