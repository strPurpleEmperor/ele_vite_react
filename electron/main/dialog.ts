import { dialog } from "electron";
export function fileTypeErr() {
  return dialog.showMessageBox({
    type: "info",
    title: "提示信息",
    defaultId: 0,
    message:
      '文件格式不符合要求!!!--格式：["url1","url2"]，或者网络异常，请重试',
    buttons: ["确定"],
  });
}

export function urlTypeErr() {
  return dialog.showMessageBox({
    type: "info",
    title: "提示信息",
    defaultId: 0,
    message: "链接不正确或者网络异常，请重试",
    buttons: ["确定"],
  });
}
