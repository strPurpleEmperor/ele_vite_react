import { BrowserWindow, IpcMain } from "electron";

import { fileTypeErr, urlTypeErr } from "./dialog";
import { getUrlList } from "./get-url-list";
import { printPDF } from "./printPDF";
export function pdf(ipcMain: IpcMain, win: BrowserWindow) {
  ipcMain.on("PDF_CHANNEL", async function (event, data) {
    const { command, value } = JSON.parse(data);
    console.log(command, value, win);
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
          await sendPDF(page_URL_list, true, win);
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
        await sendPDF(page_URL_list, false, win);
        break;
      case "GET_PDF":
        event.returnValue = "OK";
        const pdf = await printPDF(value);
        console.log(pdf, 889);
        win.webContents.send("GET_PDF".toLowerCase(), pdf);
        break;
      case "STOP_GET_PDF":
        event.returnValue = "OK";
        isPause = true;
        page_URL_list = [];
        win.webContents.send("STOP_GET_PDF".toLowerCase(), true);
        win.webContents.send("SET_LOADING".toLowerCase(), false);
        win.webContents.send("SET_STATUS".toLowerCase(), 4);
        break;
      case "RETRY_GET_PDF": //重试
        event.returnValue = "OK";
        const retryPdf = await printPDF(value.url);
        win.webContents.send("RETRY_GET_PDF".toLowerCase(), {
          pdf: retryPdf,
          index: value.index,
        });
        break;
      default:
        event.returnValue = "OK";
        win.webContents.send("", "");
    }
  });
}
let page_URL_list: string[] = [];
let isPause = false;
async function sendPDF(urlList: string[], isNew: boolean, win: BrowserWindow) {
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
    await sendPDF(urlList, false, win);
  }
}
