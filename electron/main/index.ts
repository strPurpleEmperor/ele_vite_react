import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import { release } from "node:os";
import { join } from "node:path";

import { fileTypeErr, urlTypeErr } from "./dialog";
import { getUrlList } from "./get-url-list";
import { printPDF } from "./printPDF";

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
Menu.setApplicationMenu(null);
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");
let page_URL_list: string[] = [];
let isPause = false;
async function sendPDF(urlList: string[], isNew: boolean) {
  const url = urlList.shift();
  const pdf = await printPDF(url);
  if (isPause) {
    urlList.unshift(url);
  } else {
    win.webContents.send("PAGE_URL_LIST".toLowerCase(), {
      pdf,
      isNew,
      isFinish: page_URL_list.length === 0,
    });
  }
  if (urlList.length && !isPause) {
    await sendPDF(urlList, false);
  }
}
async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1366,
    height: 800,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    await win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    await win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", async () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    await createWindow();
  }
});
app.commandLine.appendSwitch("disable-site-isolation-trials");
// New window example arg: new windows url
ipcMain.handle("open-win", async (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, //是否禁用同源策略
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await childWindow.loadURL(`${url}#${arg}`);
  } else {
    await childWindow.loadFile(indexHtml, { hash: arg });
  }
});

app.on("ready", async () => {
  ipcMain.on("windows", async function (event, data) {
    const { command, value } = JSON.parse(data);
    switch (command) {
      case "PAGE_URL_LIST":
        event.returnValue = "OK";
        try {
          const arr = JSON.parse(value);
          if (!Array.isArray(arr)) {
            await fileTypeErr();
            win.webContents.send("SET_STATUS".toLowerCase(), 1);
            break;
          }
          page_URL_list = JSON.parse(value);
          isPause = false;
          await sendPDF(page_URL_list, true);
        } catch (e) {
          await fileTypeErr();
          win.webContents.send("SET_STATUS".toLowerCase(), 1);
        }
        break;
      case "GET_URL_LIST":
        event.returnValue = "OK";
        try {
          const url_list = await getUrlList(value);
          win.webContents.send("GET_URL_LIST".toLowerCase(), url_list);
        } catch (e) {
          await urlTypeErr();
          win.webContents.send("SET_LOADING".toLowerCase(), false);
        }
        break;
      case "PAUSE_GET_PDF":
        event.returnValue = "OK";
        isPause = true;
        win.webContents.send("PAUSE_GET_PDF".toLowerCase(), true);
        break;
      case "CONTINUE_GET_PDF":
        event.returnValue = "OK";
        win.webContents.send("CONTINUE_GET_PDF".toLowerCase(), true);
        isPause = false;
        await sendPDF(page_URL_list, false);
        break;
      default:
        event.returnValue = "OK";
        win.webContents.send("", "");
    }
  });
});
