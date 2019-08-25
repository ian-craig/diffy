import { app, BrowserWindow }from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";

const providers = [
    require('./Providers/GitProvider').default,
];

let mainWindow: BrowserWindow | null;
const createWindow = async () => {
    const args = process.argv.slice(2);
    const cwd = process.cwd();
    for (const providerFactory of providers) {
        const plugin = await providerFactory(args, cwd);
        console.log("Plugin", plugin);
        if (plugin !== undefined) {
            //@ts-ignore
            global.provider = plugin;
            break;
        }
    }

    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow = null));
}
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