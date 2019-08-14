///<reference path="../../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow, Menu } = require("electron");
// const { path } = require("path");
var ElectronFileIo;
// const { path } = require("path");
(function (ElectronFileIo) {
    //create menu template
    const mainMenuTemplate = [
        {
            label: "File", submenu: [
                {
                    label: "Save", click() { ElectronFileIo.save(); }
                },
                {
                    label: "Open", click() { ElectronFileIo.load(); }
                },
                {
                    label: "Quit", accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q", click() { app.quit(); }
                }
            ]
        }
    ];
    app.addListener("ready", createWindow);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (ElectronFileIo.mainWindow === null)
            createWindow();
    });
    function createWindow() {
        // Create the browser window.
        ElectronFileIo.mainWindow = new BrowserWindow({
            width: 1400, height: 600, webPreferences: {
                nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
            }
        });
        ElectronFileIo.mainWindow.loadFile("Main.html");
        ElectronFileIo.mainWindow.webContents.openDevTools();
        ElectronFileIo.mainWindow.addListener("closed", function () {
            ElectronFileIo.mainWindow = null;
        });
        //Build menu from template
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        //Insert the menu
        Menu.setApplicationMenu(mainMenu);
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=MainTest.js.map