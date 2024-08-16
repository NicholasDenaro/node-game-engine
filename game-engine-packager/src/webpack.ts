#!/usr/bin/env node

import { execute, getArg } from "./utils.js";

const entry = getArg('--entry');

if (!entry) {
  console.error('Must list --entry, like --entry ./src/game.ts');
  process.exit(1);
}

const assets = getArg('--assets');

if (!assets) {
  console.error('Must list --assets, like --assets png,wav,mp3');
  process.exit(1);
}

console.log('running webpack...');
await execute(`npx webpack --config node_modules/game-engine-packager/webpack.config.js --entry ${entry} --env assets=${assets}`);

console.log('copying index.html...');

if (process.platform === 'win32') {
  await execute('copy src\\index.html dist-web\\index.html');
} else {
  await execute('cp src/index.html dist-web/index.html');
}