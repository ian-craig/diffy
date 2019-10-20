import { Action } from "redux";
import { SET_SETTINGS } from "./ActionTypes";
import { AppState } from "./Store";

let localFileStore: any;
//@ts-ignore
if (process.env.NODE_ENV !== "production" && window.require === undefined) {
  let values: any = {};
  localFileStore = {
    get: (key: string, defaultValue: any) => (key in values ? values[key] : defaultValue),
    set: (newValues: any) => {
      values = { ...values, ...newValues };
    },
  };
} else {
  //@ts-ignore
  const { remote } = window.require("electron");
  localFileStore = remote.getGlobal("store");
}

export type SettingsState = {
  renderSideBySide: boolean;
  includeWhitespace: boolean;
};

export const setSettings = (newSettings: Partial<SettingsState>) => ({ type: SET_SETTINGS, newSettings });

export const settingsSelector = <TKeys extends keyof SettingsState>(
  state: AppState,
  ...keys: (keyof SettingsState)[]
): Pick<SettingsState, TKeys> => {
  const result: any = {};
  for (const key of keys) {
    result[key] = state.settings[key];
  }
  return result as SettingsState;
};

interface SetSettingsAction extends Action {
  type: typeof SET_SETTINGS;
  newSettings: Partial<SettingsState>;
}

type SettingsAction = SetSettingsAction;

const defaults: SettingsState = {
  renderSideBySide: localFileStore.get("renderSideBySide", true),
  includeWhitespace: localFileStore.get("includeWhitespace", true),
};

export const settingsReducer = (state: SettingsState = defaults, action: SettingsAction) => {
  switch (action.type) {
    case SET_SETTINGS:
      localFileStore.set(action.newSettings);
      return { ...state, ...action.newSettings };
    default:
      return state;
  }
};
