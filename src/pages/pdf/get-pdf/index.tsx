import { Button, Card, Image, Input, Space, Spin } from "antd";
import { useAtom } from "jotai";
import React from "react";

import { loadingVal, pdfVal } from "@/atom/PDF/getPDF";
import { useIPC } from "@/hooks";
import { buffer2Url, downLoadPDF, sendPDFMsg } from "@/tools";
import { PDFTYPE } from "@/types";
const GET_PDF = "GET_PDF";
function GetPDF(): JSX.Element {
  const [loading, setLoading] = useAtom(loadingVal);
  useIPC(GET_PDF, getPDFHandler, []);
  const [pdf, setPDF] = useAtom(pdfVal);
  function getPDFHandler(_: any, data: PDFTYPE) {
    console.log(data);
    setPDF(data);
    setLoading(false);
  }
  function toGetPDF(val: string) {
    if (!val) return;
    sendPDFMsg(GET_PDF, val);
    setLoading(true);
  }
  function toDown() {
    downLoadPDF(pdf);
  }
  return (
    <div>
      <div style={{ width: 500 }}>
        <Input.Search
          allowClear
          enterButton="确认"
          onSearch={toGetPDF}
        ></Input.Search>
      </div>
      {loading && (
        <div style={{ marginTop: 10 }}>
          PDF 生成中，请稍后……
          <Spin />
        </div>
      )}
      <Card
        title="解析内容"
        style={{ marginTop: 20 }}
        extra={
          pdf && (
            <Space>
              <Button danger onClick={() => setPDF(null)}>
                清空
              </Button>
              {pdf?.status && (
                <Button type="primary" onClick={toDown}>
                  下载
                </Button>
              )}
            </Space>
          )
        }
      >
        <Space direction="vertical">
          <div>标题：{pdf?.title || (pdf?.status === 0 && '"解析失败"')}</div>
          <div>
            预览：
            <Image src={buffer2Url(pdf?.img)} />
          </div>
        </Space>
      </Card>
    </div>
  );
}
export default GetPDF;
