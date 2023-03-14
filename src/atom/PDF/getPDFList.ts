import { atom } from "jotai";

export const pdfListValue = atom<any[]>([]);
export const fileListValue = atom<any[]>([]);
export const statusValue = atom<0 | 1 | 2 | 3 | 4>(0);
