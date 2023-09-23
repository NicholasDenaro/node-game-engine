import { exec } from "child_process";

export function getArg(arg: string): string | undefined {
  return process.argv.indexOf(arg) >= 0 ? process.argv[process.argv.indexOf(arg) + 1] : undefined;
}

export function getFlag(arg: string): boolean {
  return process.argv.indexOf(arg) >= 0;
}

export function execute(cmd: string): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    exec(cmd, (err, stdout, stderr) => {
      console.error(err);
      console.log(stdout);
      console.error(stderr);

      if (err || stderr) {
        reject();
      }

      resolve();
    })
  );
}