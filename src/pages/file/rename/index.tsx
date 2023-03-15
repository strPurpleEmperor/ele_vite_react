import "./index.scss";

import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  notification,
  Space,
  Upload,
  UploadProps,
} from "antd";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
const colorMap = ["", "#52c41a", "#ff4d4f"];
import { fileNameVal, renameVal } from "@/atom/file/rename";
import { useIPC } from "@/hooks";
import { getFileType, sendFileMsg } from "@/tools";
const { Dragger } = Upload;
const RENAME_FILES = "RENAME_FILES";
let filesReducer: any[] = [];
function Rename() {
  const [files, setFiles] = useAtom(fileNameVal);
  const [rename, setRename] = useAtom(renameVal);
  useEffect(() => {
    const timer = setInterval(() => {
      if (filesReducer.length) {
        const _files: any[] = [];
        const _renames: string[] = [];
        filesReducer.forEach((f) => {
          _files.push(f.file);
          _renames.push(f.rename);
        });
        setFiles(files.concat(_files));
        setRename(
          (rename ? rename.split("\n") : []).concat(_renames).join("\n")
        );
        filesReducer = [];
      }
    }, 16);
    return () => {
      clearInterval(timer);
    };
  }, []);
  useIPC(RENAME_FILES, renameFileHandler, [files]);
  function renameFileHandler(
    _: any,
    data: { status: 1 | 2; newPath: string; newName: string }[]
  ) {
    let successCount = 0;
    data.forEach((d, index) => {
      if (d.status) {
        successCount++;
        files[index].status = d.status;
        files[index].name = d.newName;
        files[index].path = d.newPath;
      }
    });
    setFiles([...files]);
    notification.info({
      message: (
        <div>
          <h4>操作结果：</h4>
          <p style={{ color: "#52c41a" }}>成功{successCount}个</p>
          <p style={{ color: "#ff4d4f" }}>失败{data.length - successCount}个</p>
        </div>
      ),
    });
  }
  const props: UploadProps = {
    directory: true,
    onChange(info) {
      const f: Record<string, any> = info.file;
      const [oName, type] = getFileType(f.name);
      f.rename = oName;
      f.name = oName;
      f.type = type;
      f.status = 0; //0新文件、1成功、2失败
      f.path = f.originFileObj.path;
      filesReducer.push({ file: f, rename: oName });
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    customRequest: () => false,
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
        path: f.path,
        newPath: f.path.replace(
          `${f.name}${f.type}`,
          `${renames[index]}${f.type}`
        ),
        newName: renames[index],
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
      <Space style={{ marginTop: 10, marginBottom: 10 }}>
        <Button onClick={clearWork}>清空</Button>
        <Button disabled={!rename} type="primary" onClick={toRename}>
          重命名
        </Button>
      </Space>
      <div style={{ display: "flex" }}>
        <Card size="small" title="名称" style={{ flex: 1 }}>
          <div style={{ paddingLeft: 11, paddingTop: 4, paddingRight: 11 }}>
            {files.map((f, index) => (
              <div key={index}>
                <div style={{ color: colorMap[f.status] }}>{f.name}</div>
              </div>
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
