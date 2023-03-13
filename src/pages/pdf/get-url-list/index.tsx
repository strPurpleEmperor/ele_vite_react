import "./index.scss";

import { Button, Input, message, Spin } from "antd";
import FileSaver from "file-saver";
import React from "react";

import { useIPC } from "@/hooks";
import { useReduxValue } from "@/hooks/redux";
import { sendMsg } from "@/tools";
const GET_URL_LIST = "GET_URL_LIST";
const SET_LOADING = "SET_LOADING";
const NAME_SPACE = "getUrlList";
function GetUrlList() {
  const [loading, setLoading] = useReduxValue(NAME_SPACE, "loading");
  const [urlList, setUrlList] = useReduxValue(NAME_SPACE, "urlList");
  useIPC(GET_URL_LIST, urlListHandler, []);
  useIPC(SET_LOADING, loadingHandler, []);
  function getURL(url: string) {
    sendMsg(GET_URL_LIST, url);
    setLoading(true);
  }
  function saveURL() {
    const blob = new Blob([JSON.stringify(urlList)], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, "url-list.txt");
  }
  function urlListHandler(_: any, data: string[]) {
    const val = data.filter((d: string) => /^http/.test(d));
    if (!val.length) message.info("没有找到URL链接");
    setUrlList(val);
    setLoading(false);
  }
  function loadingHandler(_: any, data: boolean) {
    setLoading(data);
  }
  return (
    <Spin spinning={loading}>
      <div className="content">
        <Input.Search
          className="input"
          placeholder="输入URL地址"
          onSearch={getURL}
          enterButton="确认"
          allowClear
        />
        {urlList.length > 0 && (
          <>
            <div className="tips">一共{urlList.length}条URL</div>
            <Button className="btn" onClick={saveURL} type="primary">
              保存URL
            </Button>
          </>
        )}
      </div>
    </Spin>
  );
}
export default GetUrlList;
