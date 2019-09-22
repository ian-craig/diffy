import { call, put, takeLatest } from "redux-saga/effects";
import { GET_CHANGES, GET_CHANGES_SUCCEEDED, GET_CHANGES_FAILED } from "./ActionTypes";
import { IDiffProvider } from "../DataStructures/IDiffProvider";

export const getChangesSagaFactory = (provider: IDiffProvider) => {
  function* getChanges() {
    try {
      const changelists = yield call(provider.getChanges);
      yield put({ type: GET_CHANGES_SUCCEEDED, payload: changelists });
    } catch (e) {
      yield put({ type: GET_CHANGES_FAILED, message: e.message });
    }
  }

  function* getChangesSaga() {
    yield takeLatest(GET_CHANGES, getChanges);
  }

  return getChangesSaga;
};
