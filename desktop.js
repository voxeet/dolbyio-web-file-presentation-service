const { app, BrowserWindow, protocol } = require('electron');

// Indicates the URL of the server so the electron application
// can request access tokens and create conferences
const serverUrl = 'http://localhost:8081/';

function createWindow () {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
    });

    win.loadFile('dist_desktop/index.html');

    // Open the dev tools from Chromium
    win.webContents.openDevTools();
}

protocol.registerSchemesAsPrivileged([
    { scheme: 'backend', privileges: { standard: true, supportFetchAPI: true } }
]);

app.whenReady().then(() => {
    createWindow();

    protocol.interceptHttpProtocol('backend', (request, callback) => {
        request.url = request.url.replace('backend://', serverUrl);
        callback(request);
    });

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
