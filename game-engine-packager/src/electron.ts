#!/usr/bin/env node

import { execute, getArg, getFlag } from "./utils.js";
import * as fs from 'fs';

const name = getArg('--name') || 'Untitled';

const platform = getArg('--platform') || 'win32';

const arch = getArg('--arch') || 'x64';

const steam = getFlag('--steam');

const firstRun = !fs.existsSync('dist-electron\\package.json');

if (firstRun) {
  await execute('mkdir .\\dist-electron');
  await execute('mkdir .\\dist-electron\\content');

  console.log('copying package-electron.json...');
  await execute(`copy node_modules\\game-engine-packager\\package-electron.json .\\dist-electron\\package.json`);

  console.log('copying main-electron.js...');
  await execute(`copy node_modules\\game-engine-packager\\main-electron.js .\\dist-electron\\`);

  console.log('copying electron-preload.js...');
  await execute(`copy node_modules\\game-engine-packager\\electron-preload.js .\\dist-electron\\`);
}

console.log('cleaning dist-electron/content...');
await execute(`npx rimraf --glob ./dist-electron/content/*`);

console.log('copying dist-web to dist-electron/content...');
await execute(`copy .\\dist-web\\ .\\dist-electron\\content\\`);

console.log('setting electron package.json data...');
let electronPackageData = JSON.parse(fs.readFileSync(`.\\dist-electron\\package.json`).toString());
let mainPackageData = JSON.parse(fs.readFileSync(`.\\package.json`).toString());

electronPackageData['name'] = mainPackageData['name'] || 'Unknown';
electronPackageData['version'] = mainPackageData['version'] || 'Unknown';
electronPackageData['author'] = mainPackageData['author'] || 'Unknown';
electronPackageData['license'] = mainPackageData['license'] || 'Unknown';

if (!steam) {
  delete electronPackageData['dependencies']['steamworks.js'];
}

fs.writeFileSync(`.\\dist-electron\\package.json`, JSON.stringify(electronPackageData, null, 2));

console.log('running npm install for dist-electron/ ...');
await execute(`cd dist-electron && npm install`);

if (fs.existsSync('.\\window.json')) {
  console.log('copying window.json...');
  await execute(`copy .\\window.json .\\dist-electron\\`);
}

if (steam) {
  if (!fs.existsSync('steam-integrations.js')) {
    console.log('copying initial steam-integrations.js...');
    await execute(`copy node_modules\\game-engine-packager\\steam-integrations.js .\\steam-integrations.js`);
  }

  console.log('copying steam-integrations.js...');
  await execute(`copy .\\steam-integrations.js .\\dist-electron\\`);
}

console.log('cleaning dist-electron/dist...');
await execute(`npx rimraf --glob ./dist-electron/dist/*`);

console.log('running electron-packager...');
await execute(`cd dist-electron && npx electron-packager . \"${name}\" --override --platform=${platform} --arch=${arch} --out=dist`);