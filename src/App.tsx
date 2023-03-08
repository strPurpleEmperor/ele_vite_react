import "./App.scss";

import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import {
  Button,
  Image,
  Input,
  Layout,
  Menu,
  Space,
  Spin,
  Table,
  Tabs,
  Upload,
} from "antd";
import { ipcRenderer } from "electron";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FileSaver from "file-saver";
import JSZip from "jszip";
import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import { router } from "@/router";
import { buffer2Url } from "@/tools";
interface PDFTYPE {
  title: string;
  pdf: Uint8Array;
  img: Uint8Array;
}
function App() {
  const [urlList, setUrlList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sn, setSN] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [pdfList, setPdfList] = useState<PDFTYPE[]>([]);
  useEffect(() => {
    ipcRenderer.on("PAGE_URL_LIST".toLowerCase(), msgHandler);
    ipcRenderer.on("GET_URL_LIST".toLowerCase(), urlListHandler);
    ipcRenderer.on("PAUSE_GET_PDF".toLowerCase(), pauseHandler);
    ipcRenderer.on("CONTINUE_GET_PDF".toLowerCase(), contHandler);
    return () => {
      ipcRenderer.off("PAGE_URL_LIST".toLowerCase(), msgHandler);
      ipcRenderer.off("GET_URL_LIST".toLowerCase(), urlListHandler);
      ipcRenderer.off("PAUSE_GET_PDF".toLowerCase(), pauseHandler);
      ipcRenderer.off("CONTINUE_GET_PDF".toLowerCase(), contHandler);
    };
  }, [pdfList, loading, urlList]);
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
      setSN(false);
    }
  }
  function urlListHandler(_: any, data: string[]) {
    setUrlList(data.filter((d: string) => /^http/.test(d)));
    setLoading(false);
  }
  function pauseHandler(_: any, data: boolean) {
    if (data) {
      setIsPause(true);
    }
  }
  function contHandler(_: any, data: boolean) {
    if (data) {
      setIsPause(false);
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
  function fileChange(e: any) {
    const file = e.fileList[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file.originFileObj);
    reader.onload = function (e) {
      setSN(true);
      sendMsg("PAGE_URL_LIST", e?.target?.result as string);
    };
  }
  function getURL(url: string) {
    sendMsg("GET_URL_LIST", url);
    setLoading(true);
  }

  function saveURL() {
    const blob = new Blob([JSON.stringify(urlList)], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob);
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
    sendMsg("PAUSE_GET_PDF", "");
  }
  function toContinue() {
    sendMsg("CONTINUE_GET_PDF", "");
  }
  /*return (
    <Spin spinning={loading}>
      <Tabs
        type="card"
        items={[
          {
            key: "1",
            label: "获取页面URL",
            children: (
              <div>
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
              </div>
            ),
          },
          {
            key: "2",
            label: "上传URL生成PDF",
            children: (
              <div>
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={fileChange}
                >
                  <Button type="primary">点击上传</Button>
                </Upload>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Spin spinning={sn} />
                    {sn && (
                      <div style={{ marginLeft: 20 }}>
                        {isPause ? (
                          <Button
                            icon={<CaretRightOutlined />}
                            type="primary"
                            onClick={toContinue}
                          >
                            继续
                          </Button>
                        ) : (
                          <Button
                            icon={<PauseOutlined />}
                            danger
                            onClick={toPause}
                          >
                            暂停
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {!sn && <div />}
                  <Button disabled={sn || !pdfList.length} onClick={saveAllPDF}>
                    保存全部
                  </Button>
                </div>
                <Table
                  style={{ marginTop: 10 }}
                  pagination={false}
                  rowKey={(item) => item.title + Math.random()}
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
                      render: (pdf: Uint8Array, item: PDFTYPE, index) => {
                        return (
                          <Space>
                            <Button danger onClick={() => deletePDF(index)}>
                              删除
                            </Button>
                            <Button
                              type="primary"
                              onClick={() => savePDF(item)}
                            >
                              保存
                            </Button>
                          </Space>
                        );
                      },
                    },
                  ]}
                />
              </div>
            ),
          // eslint-disable-next-line max-lines
          },
        ]}
      ></Tabs>
    </Spin>
  );*/
  return (
    <Layout>
      <Layout.Sider>
        <Menu
          defaultSelectedKeys={["0"]}
          items={router.map((r, index) => ({
            title: r.name,
            key: index.toString(),
            label: <Link to={r.path}>{r.name}</Link>,
          }))}
          mode="inline"
        ></Menu>
      </Layout.Sider>
      <Layout.Content>
        <BrowserRouter>
          <Routes>
            {router.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </Layout.Content>
    </Layout>
  );
}

export default App;
