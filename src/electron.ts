import { app, BrowserWindow, screen } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import { getProviders } from "./getProviders";
import * as ElectronStore from "electron-store";

if (!isDev) {
  console.debug = () => {};
}

const providers = getProviders();

let mainWindow: BrowserWindow | null;
const createWindow = async () => {
  const args = process.argv.slice(2);
  const cwd = process.cwd();

  //@ts-ignore
  global.store = new ElectronStore();

  for (const providerFactory of providers) {
    const plugin = await providerFactory(args, cwd);
    if (plugin !== undefined) {
      //@ts-ignore
      global.provider = plugin;
      break;
    }
  }

  mainWindow = new BrowserWindow({
    ...screen.getPrimaryDisplay().size,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow!.maximize();
  });
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  mainWindow.on("closed", () => (mainWindow = null));
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
