const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

try {
  steamintegrations = require('./steam-integrations.js');
  steamintegrations.init();
} catch (e) {
  console.log('failed to load steam-integrations.js');
  console.error(e);
}

const createWindow = () => {
  let dpi = screen.getPrimaryDisplay().scaleFactor;
  console.log(dpi);
  let data = {
    width: 720,
    height: 480,
    title: 'Untitled',
    devTools: false,
    resizable: false,
    ...(fs.existsSync('./resources/app/window.json') ? JSON.parse(fs.readFileSync('./resources/app/window.json').toString()) : {})
  };

  const win = new BrowserWindow({
    width: Math.ceil(data.width / dpi),
    height: Math.ceil(data.height / dpi),
    useContentSize: true,
    resizable: data.resizable,
    title: data.title,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.resolve('./resources/app/electron-preload.js'),
      devTools: data.devTools
    }
  });

  if (data.removeMenu === undefined || data.removeMenu) {
    win.removeMenu();
  }

  win.loadFile('content/index.html');

  return win;
};

app.whenReady().then(() => {
  const win = createWindow();
  steamintegrations?.hook(win);
});