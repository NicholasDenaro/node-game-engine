#!/usr/bin/env node

import { execute, getArg } from "./utils.js";
import * as fs from 'fs';

const name = getArg('--name') || 'Untitled';

const platform = getArg('--platform') || 'win32';

const arch = getArg('--arch') || 'x64';

const width = getArg('--width') || '100';

const height = getArg('--height') || '100';


console.log('cleaning dist-electron...');
await execute(`npx rimraf --glob ./dist-electron/*`);

console.log('copying dist to dist-electron...');
await execute(`copy .\\dist\\ .\\dist-electron\\`);

console.log('copying package-electron.json...');
await execute(`copy node_modules\\game-engine-packager\\package-electron.json .\\dist-electron\\package.json`);

console.log('setting electron package.json data...');
let electronPackageData = JSON.parse(fs.readFileSync(`.\\dist-electron\\package.json`).toString());
let mainPackageData = JSON.parse(fs.readFileSync(`.\\package.json`).toString());

electronPackageData['name'] = mainPackageData['name'] || 'Unknown';
electronPackageData['version'] = mainPackageData['version'] || 'Unknown';
electronPackageData['author'] = mainPackageData['author'] || 'Unknown';
electronPackageData['license'] = mainPackageData['license'] || 'Unknown';

fs.writeFileSync(`.\\dist-electron\\package.json`, JSON.stringify(electronPackageData, null, 2));

console.log('copying main-electron.js...');
await execute(`copy node_modules\\game-engine-packager\\main-electron.js .\\dist-electron\\`);

console.log('installing electron...');
await execute(`cd dist-electron && npm install`);

console.log('setting window data...');
let mainData = fs.readFileSync(`.\\dist-electron\\main-electron.js`).toString();

mainData = mainData.replace('data.width', width);
mainData = mainData.replace('data.height', height);
mainData = mainData.replace('data.title', `'${name}'`);

fs.writeFileSync(`.\\dist-electron\\main-electron.js`, mainData);

console.log('running electron-packager...');
await execute(`cd dist-electron && npx electron-packager . \"${name}\" --override --platform=${platform} --arch=${arch}`);