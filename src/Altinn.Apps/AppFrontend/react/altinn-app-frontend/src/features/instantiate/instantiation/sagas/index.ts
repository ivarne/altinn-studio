import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { watchInstantiationSaga } from './instantiate';

export default function* instantiationSagas(): SagaIterator {
  yield fork(watchInstantiationSaga);
}
