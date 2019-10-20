import { call, put, takeLatest, all } from "redux-saga/effects";
import { GET_CHANGES, GET_CHANGES_SUCCEEDED, GET_CHANGES_FAILED, GET_DIFF_SUCCEEDED } from "./ActionTypes";
import { IDiffProvider } from "../DataStructures/IDiffProvider";
import { Action } from "redux";
import { DiffModel } from "../Utils/DiffModel";
import { IFileSpec, IFile } from "../DataStructures/IFile";
import { IDiffSpec, IDiff } from "../DataStructures/IDiff";
import { diffId } from "../Utils/DiffId";
import { IChangeList } from "../DataStructures/IChangeList";
import chunk from "chunk";

export interface GetDiffModelSucceededAction extends Action {
  type: typeof GET_DIFF_SUCCEEDED;
  model: DiffModel;
}

const loadFile = async (file: IFileSpec | undefined): Promise<IFile | undefined> => {
  if (file === undefined) {
    return undefined;
  }

  if ("content" in file) {
    return file;
  }

  return {
    ...file,
    content: await file.getContent(),
  };
};

const loadDiff = async (file: IDiffSpec): Promise<IDiff> => {
  const [left, right] = await Promise.all([loadFile(file.left), loadFile(file.right)]);
  return { left, right } as IDiff;
};

const loadDiffModel = async (diffSpec: IDiffSpec): Promise<DiffModel> => {
  const diff = await loadDiff(diffSpec);
  const id = diffId(diffSpec);

  if (diff.left !== undefined && diff.right !== undefined) {
    return {
      id,
      type: "diff",
      diff,
      filePath: diff.right.path,
    };
  } else if (diff.left) {
    return {
      id,
      type: "delete",
      diff,
      filePath: diff.left.path,
    };
  } else {
    return {
      id,
      type: "add",
      diff,
      filePath: diff.right.path,
    };
  }
};

export const getChangesSagaFactory = (provider: IDiffProvider) => {
  function* getChanges() {
    try {
      const changelists: IChangeList[] = yield call(provider.getChanges);
      yield put({ type: GET_CHANGES_SUCCEEDED, payload: changelists });

      const allDiffSpecs = changelists.flatMap(cl => cl.files);
      for (const specs of chunk(allDiffSpecs, 10)) {
        const models = yield all(specs.map(spec => call(async () => loadDiffModel(spec))));
        for (const model of models) {
          yield put({ type: GET_DIFF_SUCCEEDED, model });
        }
      }
    } catch (e) {
      yield put({ type: GET_CHANGES_FAILED, message: e.message });
    }
  }

  function* getChangesSaga() {
    yield takeLatest(GET_CHANGES, getChanges);
  }

  return getChangesSaga;
};
