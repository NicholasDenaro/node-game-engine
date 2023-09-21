const { app, BrowserWindow, screen } = require('electron');

const createWindow = () => {

  let dpi = screen.getPrimaryDisplay().scaleFactor;
  console.log(dpi);
  const win = new BrowserWindow({
    width: Math.ceil(data.width / dpi),
    height: Math.ceil(data.height / dpi) + 21,
    useContentSize: true,
    resizable: false,
    title: data.title,
  });

  win.removeMenu();

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});