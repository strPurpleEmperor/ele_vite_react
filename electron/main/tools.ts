import * as fs from "fs";

export function getChromePath() {
  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}

export function renameFiles(value: { path: string; newPath: string }[]) {
  const pArr: Promise<any>[] = [];
  value.forEach(({ path, newPath }) => {
    pArr.push(
      new Promise((resolve) => {
        fs.rename(path, newPath, (e) => {
          console.log(e);
          resolve(1);
        });
      })
    );
  });
  return Promise.all(pArr);
}
