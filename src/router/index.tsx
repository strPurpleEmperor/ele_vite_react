import React from "react";

import GetPDF from "@/pages/get-pdf";
import GetPDFList from "@/pages/get-pdf-list";
import GetUrlList from "@/pages/get-url-list";

export interface RouteType {
  path: string;
  element: React.ReactNode;
  name: string;
}
export const router: RouteType[] = [
  {
    path: "/get-url-list",
    element: <GetUrlList />,
    name: "根据页面获取URL",
  },
  {
    path: "/get-pdf-list",
    element: <GetPDFList />,
    name: "根据URL生成PDF",
  },
  {
    path: "/get-pdf",
    element: <GetPDF />,
    name: "直接生成PDF",
  },
];
