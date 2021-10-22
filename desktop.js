const { app, BrowserWindow, protocol } = require('electron');

// Indicates the URL of the server so the electron application
// can request access tokens and create conferences
const serverUrl = 'http://localhost:8081/';

function createWindow () {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: { worldSafeExecuteJavaScript: true, contextIsolation: true },
    });

    win.loadFile('dist_desktop/index.html');

    // Open the dev tools from Chromium
    win.webContents.openDevTools();

    // Inject the backend URL
    win.webContents.executeJavaScript(`backendUrl = "${serverUrl}";`);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') {
        app.quit();
    //}
});
