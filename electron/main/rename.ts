export function rename(ipcMain, win) {
  ipcMain.on("RENAME_CHANNEL", function (event, data) {
    const { command, value } = JSON.parse(data);
    console.log(value);
    switch (command) {
      default:
        event.returnValue = "OK";
        win.webContents.send("", "");
    }
  });
}
