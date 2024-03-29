import { renameFiles } from "./tools";

export function rename(ipcMain, win) {
  ipcMain.on("FILE_CHANNEL", async function (event, data) {
    const { command, value } = JSON.parse(data);
    switch (command) {
      case "RENAME_FILES":
        event.returnValue = "OK";
        const v = await renameFiles(value);
        win.webContents.send("RENAME_FILES".toLowerCase(), v);
        break;
      default:
        event.returnValue = "OK";
        win.webContents.send("", "");
    }
  });
}
