/* eslint-disable max-len */
import { SagaIterator } from 'redux-saga';
import { call,
  select,
  takeLatest,
  all,
  take,
  put } from 'redux-saga/effects';
import { get, getCurrentTaskDataElementId } from 'altinn-shared/utils';
import { IInstance } from 'altinn-shared/types';
import { getDataTypeByLayoutSetId, isStatelessApp } from 'src/utils/appMetadata';
import { putWithoutConfig } from 'src/utils/networking';
import { convertModelToDataBinding } from '../../../../utils/databindings';
import FormDataActions from '../formDataActions';
import { ILayoutSets, IRuntimeState } from '../../../../types';
import { IApplicationMetadata } from '../../../../shared/resources/applicationMetadata';
import FormRulesActions from '../../rules/rulesActions';
import FormDynamicsActions from '../../dynamics/formDynamicsActions';
import { dataTaskQueueError } from '../../../../shared/resources/queue/queueSlice';
import { GET_INSTANCEDATA_FULFILLED } from '../../../../shared/resources/instanceData/get/getInstanceDataActionTypes';
import { IProcessState } from '../../../../shared/resources/process/processReducer';
import { getFetchFormDataUrl, getStatelessFormDataUrl, invalidateCookieUrl, redirectToUpgrade } from '../../../../utils/urlHelper';
import { fetchJsonSchemaFulfilled } from '../../datamodel/datamodelSlice';

const appMetaDataSelector =
  (state: IRuntimeState): IApplicationMetadata => state.applicationMetadata.applicationMetadata;
const instanceDataSelector = (state: IRuntimeState): IInstance => state.instanceData.instance;
const processStateSelector = (state: IRuntimeState): IProcessState => state.process;
const currentSelectedPartyIdSelector = (state: IRuntimeState): string => state.party.selectedParty?.partyId;

function* fetchFormDataSaga(): SagaIterator {
  try {
    // This is a temporary solution for the "one task - one datamodel - process"
    const applicationMetadata: IApplicationMetadata = yield select(appMetaDataSelector);
    const instance: IInstance = yield select(instanceDataSelector);
    const currentTaskDataElementId = getCurrentTaskDataElementId(applicationMetadata, instance);
    const fetchedData: any = yield call(get, getFetchFormDataUrl(instance.id, currentTaskDataElementId));
    const formData = convertModelToDataBinding(fetchedData);
    yield put(FormDataActions.fetchFormDataFulfilled({ formData }));
  } catch (error) {
    yield put(FormDataActions.fetchFormDataRejected({ error }));
  }
}

export function* watchFormDataSaga(): SagaIterator {
  yield takeLatest(FormDataActions.fetchFormData, fetchFormDataSaga);
}

function* fetchFormDataInitialSaga(): SagaIterator {
  try {
    // This is a temporary solution for the "one task - one datamodel - process"
    const applicationMetadata: IApplicationMetadata = yield select(appMetaDataSelector);
    const instance: IInstance = yield select(instanceDataSelector);
    const layoutSets: ILayoutSets = yield select((state: IRuntimeState) => state.formLayout.layoutsets);

    let fetchedData: any;

    if (isStatelessApp(applicationMetadata)) {
      // stateless app
      const dataType = getDataTypeByLayoutSetId(applicationMetadata.onEntry.show, layoutSets);
      const selectedPartyId = yield select((state: IRuntimeState) => state.party.selectedParty.partyId);
      try {
        fetchedData = yield call(get, getStatelessFormDataUrl(dataType), { headers: { party: `partyid:${selectedPartyId}` } });
      } catch (error) {
        if (error?.response?.status === 403 && error.response.data) {
          const reqAuthLevel = error.response.data.RequiredAuthenticationLevel;
          if (reqAuthLevel) {
            putWithoutConfig(invalidateCookieUrl);
            yield call(redirectToUpgrade, reqAuthLevel);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } else {
      // app with instance
      const currentTaskDataId = getCurrentTaskDataElementId(applicationMetadata, instance);
      fetchedData = yield call(get, getFetchFormDataUrl(instance.id, currentTaskDataId));
    }

    const formData = convertModelToDataBinding(fetchedData);
    yield put(FormDataActions.fetchFormDataFulfilled({ formData }));

    yield call(
      FormRulesActions.fetchRuleModel,
    );

    yield call(FormDynamicsActions.fetchFormDynamics);
  } catch (error) {
    yield put(FormDataActions.fetchFormDataRejected({ error }));
    yield call(dataTaskQueueError, error);
  }
}

function* waitFor(selector) {
  if (yield select(selector)) {
    return;
  }
  while (true) {
    yield take('*');
    if (yield select(selector)) {
      return;
    }
  }
}

export function* watchFetchFormDataInitialSaga(): SagaIterator {
  while (true) {
    yield take(FormDataActions.fetchFormDataInitial);
    const processState: IProcessState = yield select(processStateSelector);
    const instance: IInstance = yield select(instanceDataSelector);
    const application: IApplicationMetadata = yield select((state: IRuntimeState) => state.applicationMetadata.applicationMetadata);
    if ((!processState || !instance || processState.taskId !== instance.process.currentTask.elementId) && !application.onEntry?.show) {
      yield all([
        take(GET_INSTANCEDATA_FULFILLED),
        take(fetchJsonSchemaFulfilled),
      ]);
    } else {
      // stateless app
      yield all([
        take(fetchJsonSchemaFulfilled),
        call(waitFor, (state: IRuntimeState) => currentSelectedPartyIdSelector(state) !== undefined),
      ]);
    }
    yield call(fetchFormDataInitialSaga);
  }
}
