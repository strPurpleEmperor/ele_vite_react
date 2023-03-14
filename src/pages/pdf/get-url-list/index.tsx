import "./index.scss";

import { Button, Input, message, Space, Spin, Table } from "antd";
import FileSaver from "file-saver";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUrlListVal, selectedKeysVal } from "@/atom/PDF";
import {
  loadingValue,
  pageSizeValue,
  selectUrlValue,
  urlListValue,
  urlValue,
} from "@/atom/PDF/getUrlList";
import { useIPC } from "@/hooks";
import { sendMsg } from "@/tools";

const SET_LOADING = "SET_LOADING";
const GET_URL_LIST = "GET_URL_LIST";
function GetUrlList() {
  const navigator = useNavigate();
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useAtom(loadingValue);
  const [urlList, setUrlList] = useAtom(urlListValue);
  const [selectUrl, setSelectUrl] = useAtom(selectUrlValue);
  const [pageSize, setPageSize] = useAtom(pageSizeValue);
  const [url, setUrl] = useAtom(urlValue);
  const setUrlListVal = useSetAtom(getUrlListVal);
  const setSelectedKeysVal = useSetAtom(selectedKeysVal);
  useEffect(() => {
    setSelectAll(urlList.length > 0 && selectUrl.length === urlList.length);
  }, [selectUrl]);
  useIPC(GET_URL_LIST, urlListHandler, []);
  useIPC(SET_LOADING, loadingHandler, []);
  function getURL(url: string) {
    setUrl(url);
    if (!url) return;
    sendMsg(GET_URL_LIST, url);
    setLoading(true);
  }
  function getUrl(o: any[], s: number[]) {
    const res = [];
    for (let i = 0; i < s.length; i++) {
      res.push(o[s[i]]?.url || "");
    }
    return res;
  }
  function saveURL() {
    if (!selectUrl.length) return message.info("没有选择的URL");
    const blob = new Blob([JSON.stringify(getUrl(urlList, selectUrl))], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, "url-list.txt");
  }
  function urlListHandler(_: any, data: string[]) {
    const val = data
      .filter((d: any) => /^http/.test(d.url))
      .map((name: any, index) => ({ ...name, index }));
    if (!val.length) message.info("没有找到URL链接");
    setUrlList(val);
    setLoading(false);
  }
  function loadingHandler(_: any, data: boolean) {
    setLoading(data);
  }
  function toSelectAll() {
    if (!selectAll) {
      setSelectUrl(new Array(urlList.length).fill(0).map((_, i) => i));
    } else {
      setSelectUrl([]);
    }
  }
  function toGetAllPDF() {
    setUrlListVal(getUrl(urlList, selectUrl));
    navigator("/pdf/get-pdf-list");
    setSelectedKeysVal(["/pdf/get-pdf-list"]);
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
          value={url}
          onInput={(v: any) => setUrl(v.target.value)}
        />
        <div style={{ marginTop: 10 }} />
        {urlList.length > 0 && (
          <Space direction="vertical">
            <Button onClick={toSelectAll} danger={selectAll}>
              {selectAll ? "取消" : "选择"}全部
            </Button>
            <Table
              scroll={{ y: 550 }}
              rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectUrl,
                onChange: function (selectedRowKeys: any) {
                  setSelectUrl(selectedRowKeys);
                },
              }}
              rowKey={(item) => item.index}
              columns={[
                {
                  title: "标题",
                  dataIndex: "name",
                  key: "name",
                  ellipsis: true,
                },
                {
                  title: "URL",
                  dataIndex: "url",
                  key: "url",
                  ellipsis: true,
                  render: (url: string) => (
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  ),
                },
              ]}
              dataSource={urlList}
              pagination={{
                pageSize,
                onChange: (_: any, size) => {
                  setPageSize(size);
                },
              }}
            />
          </Space>
        )}
        {urlList.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: 20,
            }}
          >
            <Space>
              <Button onClick={saveURL}>保存URL文件</Button>
              <Button onClick={toGetAllPDF} type="primary">
                批量下载PDF
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Spin>
  );
}
export default GetUrlList;
