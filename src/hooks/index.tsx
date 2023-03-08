import { ipcRenderer } from "electron";
import { useEffect } from "react";

export function useIPC(
  name: string,
  handler: (...arg: any[]) => any,
  deps: any[]
) {
  useEffect(() => {
    ipcRenderer.on(name.toLowerCase(), handler);
    return () => {
      ipcRenderer.off(name.toLowerCase(), handler);
    };
  }, deps);
}
