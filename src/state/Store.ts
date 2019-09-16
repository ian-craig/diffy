import { IDiffSpec } from "../DataStructures/IDiff";
import { createStore, combineReducers, Action, AnyAction } from "redux";
import { changelistsReducer, ChangeListsState } from "./ChangeLists";

export type DiffStore = {
  id: string;
  spec: IDiffSpec;
  model?: any;
};

export type AppState = {
  changelists: ChangeListsState;
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

export const createReduxStore = () => {
  //@ts-ignore
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  return createStore<AppState, AnyAction, unknown, unknown>(
    combineReducers({
      changelists: changelistsReducer,
    }),
    devToolsExtension && devToolsExtension(),
  );
};
