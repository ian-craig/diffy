import { call, put, takeEvery } from "redux-saga/effects";
import { PROVIDER_ACTION, PROVIDER_ACTION_SUCCEEDED, PROVIDER_ACTION_FAILED, GET_CHANGES } from "./ActionTypes";
import { IFileAction } from "../DataStructures/IChangeList";
import { IDiff } from "../DataStructures/IDiff";
import { Action } from "redux";

export interface ProviderActionAction extends Action {
  type: typeof PROVIDER_ACTION;
  diff: IDiff;
  fileAction: IFileAction;
}

export interface ProviderActionSucceededAction extends Action {
  type: typeof PROVIDER_ACTION_SUCCEEDED;
  action: ProviderActionAction;
}

export const providerActionSagaFactory = () => {
  function* executeAction(action: ProviderActionAction) {
    try {
      const shouldReload = yield call(() => action.fileAction.callback(action.diff));
      yield put<ProviderActionSucceededAction>({ type: PROVIDER_ACTION_SUCCEEDED, action });
      if (shouldReload) {
        yield put({ type: GET_CHANGES });
      }
    } catch (e) {
      yield put({ type: PROVIDER_ACTION_FAILED, message: e.message });
    }
  }

  function* providerActionSaga() {
    yield takeEvery(PROVIDER_ACTION, executeAction);
  }

  return providerActionSaga;
};
