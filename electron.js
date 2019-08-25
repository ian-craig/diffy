const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

global.provider = undefined;

const plugins = [
    require('./plugins/dist/plugins/GitPlugin').default,
];

let mainWindow;
const createWindow = async () => {
    const args = process.argv.slice(2);
    const cwd = process.cwd();
    for (const pluginFactory of plugins) {
        const plugin = await pluginFactory(args, cwd);
        console.log("Plugin", plugin);
        if (plugin !== undefined) {
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