const electron = require("electron")
const url = require("url")
const path = require("path");
const { Menu } = require("electron");
const { platform } = require("os");

const { app, BrowserWindow, ipcMain } = electron;

// Set ENV
process.env.NODE_ENV = "production"

let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "main.html"),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    // Insert Menu
    Menu.setApplicationMenu(mainMenu)
})

// Handle Add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shopping List Item",
        webPreferences: {
            nodeIntegration: true
        }
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "additem.html"),
        protocol: 'file',
        slashes: true
    }));

    addWindow.on('closed', () => {
        addWindow = null
    })
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item)
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add an item',
                click() {
                    createAddWindow()
                }
            },
            { type: 'separator' },
            {
                label: 'Clear All',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
        ]
    },
];

if (platform() === "darwin") {
    mainMenuTemplate.unshift({
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
        ]
    })

    mainMenuTemplate.push({
        label: "View",
        submenu: [
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    }, {
        label: "Window",
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
        ]
    }, {
        label: "help",
        submenu: [
            {
                label: 'Learn more',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal("https://electronjs.org")
                }
            }
        ]
    })
}

if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: 'Inspect',
                accelerator: platform() == "darwin" ?
                    "Command+Shift+I" : "Ctrl+Shift+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forcereload' },
        ]
    })
}
