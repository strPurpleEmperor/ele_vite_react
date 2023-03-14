export interface PDFTYPE {
  title: string;
  pdf: Uint8Array;
  img: Uint8Array;
  status: 0 | 1;
  url?: string;
}
