import {
  GET_FILE,
  GET_CHANGES_SUCCEEDED,
  GET_DIFF_SUCCEEDED,
  EDIT_DIFF,
  PROVIDER_ACTION_SUCCEEDED,
} from "./ActionTypes";
import { diffId } from "../Utils/DiffId";
import { GetChangesSucceededAction } from "./ChangeLists";
import { DiffModel, EditableDiffModel } from "../Utils/DiffModel";
import { GetDiffModelSucceededAction } from "./GetChangesSaga";
import { Action } from "redux";
import { ActionType } from "../DataStructures/IChangeList";
import { ProviderActionSucceededAction } from "./ProviderActionSaga";
import { IFile } from "../DataStructures/IFile";

export const getDiff = () => ({ type: GET_FILE });

export const editDiffContent = (id: string, content: string): EditDiffAction => ({ type: EDIT_DIFF, id, content });

interface EditDiffAction extends Action {
  type: typeof EDIT_DIFF;
  id: string;
  content: string;
}

type DiffAction =
  | GetDiffModelSucceededAction
  | GetChangesSucceededAction
  | EditDiffAction
  | ProviderActionSucceededAction;

export type DiffsState = { [id: string]: DiffModel };

export const diffsReducer = (state: DiffsState = {}, action: DiffAction) => {
  switch (action.type) {
    case GET_CHANGES_SUCCEEDED:
      const newFiles: DiffsState = {};
      for (const cl of action.payload) {
        for (const spec of cl.files) {
          const id = diffId(spec);
          newFiles[id] = { id, type: undefined, filePath: spec.right ? spec.right.path : spec.left.path };
        }
      }
      return newFiles;
    case GET_DIFF_SUCCEEDED:
      return {
        ...state,
        [action.model.id]: action.model,
      };

    case EDIT_DIFF:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          unsavedContent: action.content,
        },
      };

    case PROVIDER_ACTION_SUCCEEDED:
      if (action.action.fileAction.type === ActionType.Save) {
        const id = diffId(action.action.diff);
        return {
          ...state,
          [id]: {
            ...state[id],
            diff: action.action.diff,
            unsavedContent:
              (state[id] as EditableDiffModel).unsavedContent !== (action.action.diff.right as IFile).content
                ? (state[id] as EditableDiffModel).unsavedContent
                : undefined,
          } as DiffModel,
        };
      } else {
        return state;
      }

    default:
      return state;
  }
};
