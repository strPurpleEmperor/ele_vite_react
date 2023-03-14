import {
  CaretRightOutlined,
  PauseOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Button,
  Image,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Upload,
} from "antd";
import { ipcRenderer } from "electron";
import FileSaver from "file-saver";
import { useAtom } from "jotai";
import JSZip from "jszip";
import React, { useEffect } from "react";

import { getUrlListVal } from "@/atom/PDF";
import {
  fileListValue,
  pdfListValue,
  statusValue,
} from "@/atom/PDF/getPDFList";
import { useIPC } from "@/hooks";
import { buffer2Url } from "@/tools";
import { PDFTYPE } from "@/types";
const PAGE_URL_LIST = "PAGE_URL_LIST";
const PAUSE_GET_PDF = "PAUSE_GET_PDF";
const STOP_GET_PDF = "STOP_GET_PDF";
const CONTINUE_GET_PDF = "CONTINUE_GET_PDF";
const RETRY_GET_PDF = "RETRY_GET_PDF";
const SET_STATUS = "SET_STATUS";
function GetPDFList() {
  const [pdfList, setPdfList] = useAtom(pdfListValue);
  const [fileList, setFileList] = useAtom(fileListValue);
  const [urlList, setUrlList] = useAtom(getUrlListVal);
  const [status, setStatus] = useAtom(statusValue); // 0没有文件，1有文件未开始，2进行中，3暂停,4完成
  useIPC(PAGE_URL_LIST, msgHandler, [pdfList]);
  useIPC(PAUSE_GET_PDF, pauseHandler, []);
  useIPC(CONTINUE_GET_PDF, contHandler, []);
  useIPC(SET_STATUS, statusHandler, []);
  useIPC(RETRY_GET_PDF, retryHandler, []);
  useEffect(() => {
    if (urlList.length) {
      sendMsg(PAGE_URL_LIST, JSON.stringify(urlList));
      setStatus(2);
      setUrlList([]);
    }
  }, []);
  function statusHandler(_: any, data: 0 | 1 | 2 | 3 | 4) {
    setStatus(data);
  }
  function retryHandler(_: any, data: { pdf: PDFTYPE; index: number }) {
    pdfList[data.index] = data.pdf;
    setPdfList([...pdfList]);
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
  function sendMsg(command: string, value: any) {
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
    if (e.fileList.length) {
      if (status === 2) {
        Modal.confirm({
          content: "有正在进行中的任务，是否覆盖？",
          onOk: () => {
            toStop();
            setStatus(1);
            setFileList(e.fileList);
          },
        });
      } else {
        setStatus(1);
        setFileList(e.fileList);
      }
    } else {
      setStatus(0);
      setFileList([]);
    }
  }
  function saveAllPDF() {
    const zip = new JSZip();
    const promises: Promise<any>[] = [];
    pdfList
      .filter((p) => p.status)
      .forEach((p) => {
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
      .catch(() => {
        message.error("保存失败请重试");
      });
  }
  function toPause() {
    sendMsg(PAUSE_GET_PDF, "");
  }
  function toStop() {
    sendMsg(STOP_GET_PDF, "");
  }
  function toContinue() {
    sendMsg(CONTINUE_GET_PDF, "");
  }
  function toRetry(item: PDFTYPE, index: number) {
    sendMsg(RETRY_GET_PDF, { url: item.url, index });
    pdfList[index].loading = true;
    setPdfList([...pdfList]);
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
              <Space>
                <Button icon={<PauseOutlined />} danger onClick={toPause}>
                  暂停
                </Button>
                <Button icon={<StopOutlined />} danger onClick={toStop}>
                  停止
                </Button>
              </Space>
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
            render: (title: string) => title || "解析失败",
          },
          {
            title: "预览",
            dataIndex: "img",
            key: "img",
            ellipsis: true,
            render: (img: Uint8Array, { status, url }) => {
              if (status)
                return <Image width={100} height={100} src={buffer2Url(img)} />;
              else
                return (
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                );
            },
          },
          {
            title: "操作",
            dataIndex: "pdf",
            key: "pdf",
            width: 180,
            render: (pdf: Uint8Array, item: PDFTYPE, index: number) => {
              return (
                <Button
                  loading={item.loading}
                  onClick={() => toRetry(item, index)}
                >
                  重试
                </Button>
              );
            },
          },
        ]}
      />
    </>
  );
}
export default GetPDFList;
