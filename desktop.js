const { app, BrowserWindow, protocol } = require('electron');

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
        request.url = request.url.replace('backend://', 'http://localhost:8081/');
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
