import "./index.scss";

import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Space, Upload, UploadProps } from "antd";
import { useAtom } from "jotai";
import React, { useEffect } from "react";

import { fileNameVal, renameVal } from "@/atom/file/rename";
import { useIPC } from "@/hooks";
import { getFileType, sendFileMsg } from "@/tools";
const { Dragger } = Upload;
const RENAME_FILES = "RENAME_FILES";
function Rename() {
  const [files, setFiles] = useAtom(fileNameVal);
  const [rename, setRename] = useAtom(renameVal);
  useIPC(RENAME_FILES, renameFileHandler, []);
  function renameFileHandler(_: any, data: any) {
    console.log(data);
    message.success("重命名成功");
  }
  const props: UploadProps = {
    directory: true,
    onChange(info) {
      console.log(info);
      const { status } = info.file;
      if (status !== "uploading") {
        const _rename: string[] = [];
        setFiles(
          info.fileList.map((f: any) => {
            if (!f.rename) {
              const [oName, type] = getFileType(f.name);
              f.rename = oName;
              f.type = type;
            }
            _rename.push(f.rename);
            return f;
          })
        );
        setRename(_rename.join("\n"));
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    beforeUpload: () => false,
    showUploadList: false,
    fileList: files,
  };
  useEffect(() => {
    const renameList = rename.split("\n");
    if (renameList.length > 0) {
      const fList = [...files];
      renameList.forEach((r, i) => {
        if (fList[i]) {
          fList[i].rename = r;
        }
      });
      setFiles(fList);
    }
  }, [rename]);
  function clearWork() {
    setFiles([]);
    setRename("");
  }
  function toRename() {
    const renames = rename.split("\n");
    if (files.length !== renames.length) return message.error("两边数量不相等");
    const value: any[] = [];
    files.forEach((f, index) => {
      value.push({
        path: f.originFileObj.path,
        newPath: f.originFileObj.path.replace(
          `${f.name}${f.type}`,
          `${renames[index]}${f.type}`
        ),
      });
    });
    sendFileMsg(RENAME_FILES, value);
  }
  return (
    <div className="rename">
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">单击或拖动文件夹到此区域</p>
      </Dragger>
      <Space>
        <Button onClick={clearWork}>清空</Button>
        <Button disabled={!rename} type="primary" onClick={toRename}>
          重命名
        </Button>
      </Space>
      <div style={{ display: "flex" }}>
        <Card size="small" title="名称" style={{ flex: 1 }}>
          <div style={{ paddingLeft: 10, paddingTop: 5 }}>
            {files.map((f, index) => (
              <div key={index}>{f.name}</div>
            ))}
          </div>
        </Card>
        <Card size="small" title="修改名称" style={{ flex: 1 }}>
          <Input.TextArea
            value={rename}
            maxLength={-1}
            autoSize
            onInput={(e: any) => setRename(e.target.value)}
          />
        </Card>
      </div>
    </div>
  );
}
export default Rename;
