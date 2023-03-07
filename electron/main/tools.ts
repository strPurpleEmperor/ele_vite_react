export function getChromePath() {
    if (process.platform === 'win32'){
        return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    }
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
}