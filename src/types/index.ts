export interface PDFTYPE {
  title: string;
  pdf: Uint8Array;
  img: Uint8Array;
  status: 0 | 1;
  url?: string;
  loading?: boolean;
}
export interface Rule {
  rule: (arg: any) => any;
  ruleName: string;
}
