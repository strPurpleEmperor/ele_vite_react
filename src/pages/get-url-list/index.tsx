import { Button, Input, Spin } from "antd";
import FileSaver from "file-saver";
import React, { useState } from "react";

import { useIPC } from "@/hooks";
import { sendMsg } from "@/tools";
const command = "GET_URL_LIST";
function GetUrlList() {
  const [loading, setLoading] = useState(false);
  const [urlList, setUrlList] = useState<string[]>([]);
  useIPC(command, urlListHandler, []);
  function getURL(url: string) {
    sendMsg(command, url);
    setLoading(true);
  }
  function saveURL() {
    const blob = new Blob([JSON.stringify(urlList)], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, "url-list.txt");
  }
  function urlListHandler(_: any, data: string[]) {
    setUrlList(data.filter((d: string) => /^http/.test(d)));
    setLoading(false);
  }
  return (
    <Spin spinning={loading}>
      <Input.Search
        placeholder="输入URL地址"
        onSearch={getURL}
        enterButton="确认"
      />
      {urlList.length > 0 && (
        <>
          <div>一共{urlList.length}条</div>
          <Button onClick={saveURL}>保存URL</Button>
        </>
      )}
    </Spin>
  );
}
export default GetUrlList;
