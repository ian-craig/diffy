import { createStore, combineReducers, AnyAction, applyMiddleware, compose } from "redux";
import { changelistsReducer, ChangeListsState, getChangelists } from "./ChangeLists";
import { IDiffProvider } from "../DataStructures/IDiffProvider";
import createSagaMiddleware from "@redux-saga/core";
import { getChangesSagaFactory } from "./GetChangesSaga";
import { DiffsState, diffsReducer } from "./Diffs";
import { SettingsState, settingsReducer } from "./Settings";
import { selectedReducer, SelectedState } from "./Selected";
import { providerActionSagaFactory } from "./ProviderActionSaga";

export type AppState = {
  changelists: ChangeListsState;
  diffs: DiffsState;
  settings: SettingsState;
  selected: SelectedState;
};

export const createReduxStore = (provider: IDiffProvider) => {
  //@ts-ignore
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore<AppState, AnyAction, unknown, unknown>(
    combineReducers({
      changelists: changelistsReducer,
      diffs: diffsReducer,
      settings: settingsReducer,
      selected: selectedReducer,
    }),
    compose(
      applyMiddleware(sagaMiddleware),
      devToolsExtension && devToolsExtension(),
    ),
  );

  sagaMiddleware.run(getChangesSagaFactory(provider));
  sagaMiddleware.run(providerActionSagaFactory());

  store.dispatch(getChangelists());

  return store;
};
