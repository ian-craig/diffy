export interface ISettings {
  renderSideBySide: boolean;
}

const defaults: ISettings = {
  renderSideBySide: true,
};

/**
 * A persistent settings store saved to the local user dir
 */
export class SettingsStore {
  private readonly store: any;

  public constructor() {
    //@ts-ignore
    if (process.env.NODE_ENV !== "production" && window.require === undefined) {
      let values: any = {};
      this.store = {
        get: (key: string, defaultValue: any) => (key in values ? values[key] : defaultValue),
        set: (newValues: any) => {
          values = { ...values, ...newValues };
        },
      };
    } else {
      //@ts-ignore
      const { remote } = window.require("electron");
      this.store = remote.getGlobal("store");
    }
  }

  public getAll(): ISettings {
    const result: any = {};
    for (const key of Object.keys(defaults) as (keyof ISettings)[]) {
      result[key] = this.get(key);
    }
    return result as ISettings;
  }

  public get<TKey extends keyof ISettings>(key: TKey): ISettings[TKey] {
    return this.store.get(key, defaults[key]) as ISettings[TKey];
  }

  public set(newSettings: Partial<ISettings>): void {
    this.store.set(newSettings);
  }
}
