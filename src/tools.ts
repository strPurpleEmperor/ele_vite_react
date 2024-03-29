import dayjs from "dayjs";
import { ipcRenderer } from "electron";
import FileSaver from "file-saver";

import { PDFTYPE, Rule } from "@/types";

export function download(url = "", fileName = "未知文件") {
  const a = document.createElement("a");
  a.style.display = "none";
  a.setAttribute("target", "_blank");
  /*
   * download的属性是HTML5新增的属性
   * href属性的地址必须是非跨域的地址，如果引用的是第三方的网站或者说是前后端分离的项目(调用后台的接口)，这时download就会不起作用。
   * 此时，如果是下载浏览器无法解析的文件，例如.exe,.xlsx..那么浏览器会自动下载，但是如果使用浏览器可以解析的文件，比如.txt,.png,.pdf....浏览器就会采取预览模式
   * 所以，对于.txt,.png,.pdf等的预览功能我们就可以直接不设置download属性(前提是后端响应头的Content-Type: application/octet-stream，如果为application/pdf浏览器则会判断文件为 pdf ，自动执行预览的策略)
   */
  fileName && a.setAttribute("download", fileName);
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function buffer2Url(buffer?: Uint8Array) {
  if (!buffer) return;
  return (
    "data:image/png;base64," +
    window.btoa(
      new Uint8Array(buffer).reduce((res, byte) => {
        return res + String.fromCharCode(byte);
      }, "")
    )
  );
}

export function sendPDFMsg(command: string, value: any) {
  ipcRenderer.sendSync(
    "PDF_CHANNEL",
    JSON.stringify({
      command: command,
      value: value,
    })
  );
}
export function sendFileMsg(command: string, value: any) {
  ipcRenderer.sendSync(
    "FILE_CHANNEL",
    JSON.stringify({
      command: command,
      value: value,
    })
  );
}

export function downLoadPDF(pdf: PDFTYPE | null) {
  if (!pdf) return;
  const file = new Blob([pdf.pdf], {
    type: "application/pdf",
  });
  FileSaver.saveAs(file, `${pdf.title}.pdf`);
}
export function saveAs(file: Blob | string, fileName: string) {
  FileSaver.saveAs(file, fileName);
}
export function first2Up(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getFileType(v: string): [string, string] {
  const arr = v.split(".");

  if (arr.length > 1) {
    const suffix = arr[arr.length - 1] || "";
    arr.pop();
    return [arr.join("."), "." + suffix];
  }
  return [v, ""];
}

export const RULES: Rule[] = [
  {
    ruleName: "保留整数",
    rule: (val: number) => {
      if (val) return val.toFixed(0);
      return val;
    },
  },
  {
    ruleName: "保留一位小数",
    rule: (val: number) => {
      if (val) return val.toFixed(1);
      return val;
    },
  },
  {
    ruleName: "保留两位小数",
    rule: (val: number) => {
      if (val) return val.toFixed(2);
      return val;
    },
  },
  {
    ruleName: "日期：2023/03/01",
    rule: (val: string) => {
      if (val) return dayjs(val)?.format("YYYY/MM/DD");
      return val;
    },
  },
  {
    ruleName: "日期：2023-03-01",
    rule: (val: string) => {
      if (val) return dayjs(val)?.format("YYYY-MM-DD");
      return val;
    },
  },
  {
    ruleName: "日期：2023/03/01 13:30",
    rule: (val: string) => {
      if (val) return dayjs(val)?.format("YYYY/MM/DD HH:mm");
      return val;
    },
  },
  {
    ruleName: "日期：2023-03-01 13:30",
    rule: (val: string) => {
      if (val) return dayjs(val)?.format("YYYY-MM-DD HH:mm");
      return val;
    },
  },
];
