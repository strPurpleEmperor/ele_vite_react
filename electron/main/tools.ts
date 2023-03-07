export function getChromePath() {
  if (process.platform === "win32") {
    return "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}
