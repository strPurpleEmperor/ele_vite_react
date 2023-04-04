import { atom } from "jotai";
export const openKeysVal = atom<string[]>(["/pdf"]);
export const selectedKeysVal = atom<string[]>(["/pdf/get-url-list"]);

export const collapsedVal = atom<boolean>(false);
