import { SagaIterator } from 'redux-saga';
import { actionChannel, call, put, select, take } from 'redux-saga/effects';
import { IRuntimeState, IValidationResult } from 'src/types';
import { PayloadAction } from '@reduxjs/toolkit';
import { getLayoutComponentById, getLayoutIdForComponent } from '../../../../utils/layout';
import { getValidator, validateComponentFormData } from '../../../../utils/validation';
import FormDynamicActions from '../../dynamics/formDynamicsActions';
import { updateComponentValidations } from '../../validation/validationSlice';
import FormDataActions from '../formDataActions';
import { IUpdateFormData } from '../formDataTypes';
import { FormLayoutActions } from '../../layout/formLayoutSlice';
import { getCurrentDataTypeForApplication } from '../../../../utils/appMetadata';

function* updateFormDataSaga({ payload: {
  field,
  data,
  componentId,
  skipValidation,
  skipAutoSave,
} }: PayloadAction<IUpdateFormData>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();
    const focus = state.formLayout.uiConfig.focus;

    if (!skipValidation) {
      yield call(runValidations, field, data, componentId, state);
    }

    if (shouldUpdateFormData(state.formData.formData[field], data)) {
      if (!skipAutoSave) {
        yield put(FormDataActions.updateFormDataFulfilled({ field, data }));
      } else {
        yield put(FormDataActions.updateFormDataSkipAutosave({ field, data }));
      }
    }

    if (state.formDynamics.conditionalRendering) {
      yield call(FormDynamicActions.checkIfConditionalRulesShouldRun);
    }

    if (focus && focus !== '' && componentId !== focus) {
      yield put(FormLayoutActions.updateFocus({ currentComponentId: '' }));
    }
  } catch (error) {
    console.error(error);
    yield put(FormDataActions.updateFormDataRejected({ error }));
  }
}

function* runValidations(
  field: string,
  data: any,
  componentId: string,
  state: IRuntimeState,
) {
  if (!componentId) {
    yield put(FormDataActions.updateFormDataRejected({ error: new Error('Missing component ID!') }));
  }

  const currentDataTypeId = getCurrentDataTypeForApplication(
    state.applicationMetadata.applicationMetadata,
    state.instanceData.instance,
    state.formLayout.layoutsets,
  );
  const validator = getValidator(currentDataTypeId, state.formDataModel.schemas);
  const component = getLayoutComponentById(componentId, state.formLayout.layouts);
  const layoutId = getLayoutIdForComponent(componentId, state.formLayout.layouts);

  const validationResult: IValidationResult = validateComponentFormData(
    layoutId,
    data,
    field,
    component,
    state.language.language,
    state.textResources.resources,
    validator,
    state.formValidations.validations[componentId],
    componentId !== component.id ? componentId : null,
  );

  const componentValidations = validationResult?.validations[layoutId][componentId];
  const invalidDataComponents = state.formValidations.invalidDataTypes || [];
  const updatedInvalidDataComponents = invalidDataComponents.filter((item) => item !== field);
  if (validationResult?.invalidDataTypes) {
    updatedInvalidDataComponents.push(field);
  }

  yield put(updateComponentValidations({
    componentId,
    layoutId,
    validations: componentValidations,
    invalidDataTypes: updatedInvalidDataComponents,
  }));
}

function shouldUpdateFormData(currentData: any, newData: any): boolean {
  if (newData && newData !== '' && !currentData) {
    return true;
  }

  if (currentData !== newData) {
    return true;
  }

  return false;
}

export function* watchUpdateFormDataSaga(): SagaIterator {
  const requestChan = yield actionChannel(FormDataActions.updateFormData);
  while (true) {
    const value = yield take(requestChan);
    yield call(updateFormDataSaga, value);
  }
}
