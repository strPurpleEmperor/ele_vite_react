import * as fs from "fs";

export function getChromePath() {
  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}

export function renameFiles(
  value: { path: string; newPath: string; newName: string }[]
) {
  const pArr: Promise<any>[] = [];
  value.forEach(({ path, newPath, newName }) => {
    pArr.push(
      new Promise((resolve) => {
        fs.rename(path, newPath, (e) => {
          if (e === null) {
            resolve({
              status: 1,
              newPath,
              newName,
            });
          } else {
            resolve({
              status: 2,
              newPath: "",
              newName: "",
            });
          }
        });
      })
    );
  });
  return Promise.all(pArr);
}
