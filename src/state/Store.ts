import { createStore, combineReducers, AnyAction, applyMiddleware, compose } from "redux";
import { changelistsReducer, ChangeListsState, getChangelists } from "./ChangeLists";
import { IDiffProvider } from "../DataStructures/IDiffProvider";
import createSagaMiddleware from "@redux-saga/core";
import { getChangesSagaFactory } from "./GetChangesSaga";
import { DiffsState, diffsReducer } from "./Diffs";

export type AppState = {
  changelists: ChangeListsState;
  diffs: DiffsState;
};
/*
export type AppState = {
    settings: {
        [name: string]: number | string,
    },
    changelists: [

    ],
    diffs: {
        [id: string]: DiffStore,
    }
    selected: {
        type: "diff" | "changelist",
        id: string,
    }
}
*/

export const createReduxStore = (provider: IDiffProvider) => {
  //@ts-ignore
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore<AppState, AnyAction, unknown, unknown>(
    combineReducers({
      changelists: changelistsReducer,
      diffs: diffsReducer,
    }),
    compose(
      applyMiddleware(sagaMiddleware),
      devToolsExtension && devToolsExtension(),
    ),
  );

  sagaMiddleware.run(getChangesSagaFactory(provider));

  store.dispatch(getChangelists());

  return store;
};
