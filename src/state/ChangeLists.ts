import { IChangeList, IFileAction } from "../DataStructures/IChangeList";
import { Reducer, Action } from "redux";
import { LOAD_CHANGELISTS } from "./ActionTypes";
import { diffId } from "../Utils/DiffId";

export const loadChangelists = (changeLists: IChangeList[]) => {};

interface LoadChangelistsAction extends Action {
  type: typeof LOAD_CHANGELISTS;
  payload: IChangeList[];
}

type ChangeListAction = LoadChangelistsAction;

type ChangeListState = {
  id: string;
  name: string;
  fileIds: string[];
  fileActions: IFileAction[];
};

export type ChangeListsState = ChangeListState[];

export const changelistsReducer: Reducer<ChangeListsState, ChangeListAction> = (
  state: ChangeListsState = [],
  action: ChangeListAction,
) => {
  switch (action.type) {
    case LOAD_CHANGELISTS:
      return action.payload.map(cl => ({
        id: cl.id,
        name: cl.name,
        fileIds: cl.files.map(diffId),
        fileActions: cl.fileActions || [],
      }));
    default:
      return state;
  }
};
