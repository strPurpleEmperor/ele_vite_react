import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { Button, Image, Space, Spin, Table, Upload } from "antd";
import { ipcRenderer } from "electron";
import FileSaver from "file-saver";
import JSZip from "jszip";
import React, { useState } from "react";

import { useIPC } from "@/hooks";
import { buffer2Url } from "@/tools";
import { PDFTYPE } from "@/types";
const PAGE_URL_LIST = "PAGE_URL_LIST";
const PAUSE_GET_PDF = "PAUSE_GET_PDF";
const CONTINUE_GET_PDF = "CONTINUE_GET_PDF";
const SET_STATUS = "SET_STATUS";
function GetPDFList() {
  const [pdfList, setPdfList] = useState<PDFTYPE[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4>(0); // 0没有文件，1有文件未开始，2进行中，3暂停,4完成
  useIPC(PAGE_URL_LIST, msgHandler, [pdfList]);
  useIPC(PAUSE_GET_PDF, pauseHandler, []);
  useIPC(CONTINUE_GET_PDF, contHandler, []);
  useIPC(SET_STATUS, statusHandler, []);
  function statusHandler(_: any, data: 0 | 1 | 2 | 3 | 4) {
    setStatus(data);
  }
  function msgHandler(
    _: any,
    data: { isFinish: boolean; isNew: boolean; pdf: PDFTYPE }
  ) {
    const { isNew, isFinish, pdf } = data;
    if (isNew) {
      setPdfList([pdf]);
    } else {
      const arr = pdfList.concat(pdf);
      setPdfList(arr);
    }
    if (isFinish) {
      setStatus(4);
    }
  }
  function pauseHandler(_: any, data: boolean) {
    if (data) {
      setStatus(3);
    }
  }
  function contHandler(_: any, data: boolean) {
    if (data) {
      setStatus(2);
    }
  }
  function sendMsg(command: string, value: string) {
    ipcRenderer.sendSync(
      "windows",
      JSON.stringify({
        command: command,
        value: value,
      })
    );
  }
  function toStart() {
    const reader = new FileReader();
    reader.readAsText(fileList[0].originFileObj);
    reader.onload = function (e) {
      setStatus(2);
      sendMsg(PAGE_URL_LIST, e?.target?.result as string);
    };
  }
  function fileChange(e: any) {
    setFileList(e.fileList);
    if (e.fileList.length) {
      setStatus(1);
    } else {
      setStatus(0);
    }
  }
  function deletePDF(i: number) {
    pdfList.splice(i, 1);
    setPdfList([...pdfList]);
  }
  function savePDF(p: PDFTYPE) {
    const file = new Blob([p.pdf], {
      type: "application/pdf",
    });

    FileSaver.saveAs(file, `${p.title}.pdf`);
  }
  function saveAllPDF() {
    const zip = new JSZip();
    const promises: Promise<any>[] = [];
    pdfList.forEach((p) => {
      const file = zip.file(`${p.title}.pdf`, p.pdf, { binary: true });
      promises.push(Promise.resolve(file));
    });
    const rename = new Date().toString();
    Promise.all(promises)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          // 生成二进制流
          FileSaver.saveAs(content, rename); // 利用file-saver保存文件  自定义文件名
        });
      })
      .catch(() => {});
  }
  function toPause() {
    sendMsg(PAUSE_GET_PDF, "");
  }
  function toContinue() {
    sendMsg(CONTINUE_GET_PDF, "");
  }
  return (
    <>
      <div style={{ width: 200 }}>
        <Upload
          fileList={fileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={fileChange}
        >
          <Button type="primary">点击上传</Button>
        </Upload>
      </div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: 20 }}>
            {status === 1 && (
              <Button
                type="primary"
                icon={<CaretRightOutlined />}
                onClick={toStart}
              >
                开始
              </Button>
            )}
            {status === 2 && (
              <Button icon={<PauseOutlined />} danger onClick={toPause}>
                暂停
              </Button>
            )}
            {status === 3 && (
              <Button
                icon={<CaretRightOutlined />}
                type="primary"
                onClick={toContinue}
              >
                继续
              </Button>
            )}
          </div>
          <Spin spinning={status === 2} />
        </div>
        {!status && <div />}
        <Button disabled={status !== 4 || !pdfList.length} onClick={saveAllPDF}>
          保存全部
        </Button>
      </div>
      <Table
        style={{ marginTop: 10 }}
        pagination={false}
        rowKey={(item: PDFTYPE) => item.title + Math.random()}
        dataSource={pdfList}
        columns={[
          {
            title: "名称",
            dataIndex: "title",
            key: "title",
          },
          {
            title: "预览",
            dataIndex: "img",
            key: "img",
            render: (img: Uint8Array) => {
              return <Image width={100} src={buffer2Url(img)} />;
            },
          },
          {
            title: "操作",
            dataIndex: "pdf",
            key: "pdf",
            width: 180,
            render: (pdf: Uint8Array, item: PDFTYPE, index: number) => {
              return (
                <Space>
                  <Button danger onClick={() => deletePDF(index)}>
                    删除
                  </Button>
                  <Button type="primary" onClick={() => savePDF(item)}>
                    保存
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
    </>
  );
}
export default GetPDFList;
