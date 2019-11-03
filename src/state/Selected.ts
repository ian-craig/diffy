import { Action } from "redux";
import { SET_SELECTED } from "./ActionTypes";
import { AppState } from "./Store";

export const setSelectedDiff = (id: string) => ({
  type: SET_SELECTED,
  newState: { type: "diff", id },
});

export const selectedDiffSelector = (state: AppState) => {
  if (state.selected.id === undefined || state.diffs[state.selected.id] === undefined) {
    return undefined;
  }
  return state.diffs[state.selected.id];
};

export const selectedChangelistSelector = (state: AppState) => {
  if (state.selected.id === undefined || state.diffs[state.selected.id] === undefined) {
    return undefined;
  }
  const diffId = state.selected.id;
  return state.changelists.find(cl => cl.fileIds.includes(diffId));
};

interface SetSelectedAction extends Action {
  type: typeof SET_SELECTED;
  newState: { type: "diff"; id: string };
}

export type SelectedState = { type: "diff" | "changelist"; id: string | undefined };
const unselectedState: SelectedState = { type: "diff", id: undefined };

export const selectedReducer = (state: SelectedState = unselectedState, action: SetSelectedAction) => {
  switch (action.type) {
    case SET_SELECTED:
      return action.newState;
    default:
      return state;
  }
};
