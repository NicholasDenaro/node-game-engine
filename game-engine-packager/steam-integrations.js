const { ipcMain } = require('electron');
const steamworks = require('steamworks.js');

let client;

function init() {
  client = steamworks.init(480);
  steamworks.electronEnableSteamOverlay();
}

function hook(win) {
  console.log('hooked window');
  ipcMain.on('steam.name', (event, args) => {
    console.log('got event for steam name');
    win.webContents.send('steam', client.localplayer.getName());
  });
}

module.exports = {
  init,
  hook
}