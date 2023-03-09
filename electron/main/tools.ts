export function getChromePath() {
  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}
