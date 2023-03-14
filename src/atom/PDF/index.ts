import { atom } from "jotai";
export const getUrlListVal = atom<string[]>([]);
export const openKeysVal = atom<string[]>(["/pdf"]);
export const selectedKeysVal = atom<string[]>(["/pdf/get-url-list"]);
