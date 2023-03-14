import React from "react";

import Rename from "@/pages/file/rename";
import GetPDF from "@/pages/pdf/get-pdf";
import GetPDFList from "@/pages/pdf/get-pdf-list";
import GetUrlList from "@/pages/pdf/get-url-list";
export interface RouteType {
  path: string;
  Component?: React.ElementType;
  name: string;
  children?: RouteType[];
  redirect?: string;
}
export const router: RouteType[] = [
  {
    path: "/pdf",
    name: "生成PDF",
    children: [
      {
        path: "/pdf/get-url-list",
        Component: GetUrlList,
        name: "根据页面获取URL",
      },
      {
        path: "/pdf/get-pdf-list",
        Component: GetPDFList,
        name: "根据URL生成PDF",
      },
      {
        path: "/pdf/get-pdf",
        Component: GetPDF,
        name: "直接生成PDF",
      },
    ],
  },
  {
    path: "/file",
    name: "文件操作",
    children: [
      {
        path: "/file/rename",
        Component: Rename,
        name: "批量重命名",
      },
    ],
  },
];
