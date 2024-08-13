const { exec } = require('child_process');
const fs = require('fs');

const dirs = fs.readdirSync('./assets/premade/raws', {recursive: true});
dirs.forEach(directory => {
  if (directory.search(/(\.wav|.mp3|.ogg)$/) > -1) {
    directory = directory.replace(/\\/g, '/');
    const file = directory.split('/').at(-1);
    const path = directory.split('/').slice(0, -1).join('/');
    console.log(`starting ${path}/${file} ...`);
    try {
      fs.mkdirSync(`./assets/premade/outputs/${path}`);
    } catch {}
    exec(
      `ffmpeg -i "./assets/premade/raws/${path}/${file}" -y -c:a libvorbis -b:a 48k "./assets/premade/outputs/${path}/${file.split('.')[0]}.ogg"`,
      (err, stdout) => {
        if (err) {
          console.log('error');
          console.log(err);
          console.log();
          return;
        }

        console.log(`done ${path}/${file}`);
      }
    );
  }
});