import "./index.scss";

import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Image, Input, Space, Upload } from "antd";
import Templatemode from "docxtemplater";
import FileSaver from "file-saver";
import JSZip from "jszip";
import xlsx from "node-xlsx";
import PizZip from "pizzip";
import React, { useState } from "react";

import mergeDemo from "@/assets/merge_demo.png";
import { getFileType } from "@/tools";
function Merge() {
  const [word, setWord] = useState<ArrayBuffer>(new ArrayBuffer(0));
  const [excel, setExcel] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  function mergeFile() {
    const jsZip = new JSZip();
    const excelData = JSON.parse(JSON.stringify(excel[0].data || []));
    const keys: string[] = excelData.shift();
    const values: any[][] = excelData;
    const p: any[] = [];
    const nameMap: Record<string, number> = {};
    values.forEach((v) => {
      const zip = new PizZip(word);
      const doc = new Templatemode(zip);
      const data: Record<string, any> = {};
      keys.forEach((k, index) => {
        data[k] = v[index] || 0;
      });
      doc.setData(data);
      doc.render();
      console.log(data);
      let name = fileName.replace(/{([\W\w]+)}/g, function (match, $1) {
        return data[$1];
      });
      if (nameMap[name] !== void 0) {
        nameMap[name]++;
        const [oName, fileType] = getFileType(name);
        name = oName + `(${nameMap[name]})` + fileType;
      } else {
        nameMap[name] = 0;
      }
      console.log(nameMap);
      const buf = doc.getZip()?.generate({ type: "blob" }) as Blob;
      p.push({ buf, name });
    });
    p.forEach((p) => {
      jsZip.file(p.name, p.buf, {
        binary: true,
      });
    });
    const rename = new Date().toString();
    jsZip.generateAsync({ type: "blob" }).then((content) => {
      // 生成二进制流
      FileSaver.saveAs(content, rename); // 利用file-saver保存文件  自定义文件名
    });
  }
  return (
    <div className="merge">
      <div className="merge_wrap">
        <Upload.Dragger
          className="merge_upload"
          accept=".docx"
          beforeUpload={() => false}
          maxCount={1}
          onChange={async (info) => {
            if (!info.fileList.length) {
              return setWord(new ArrayBuffer(0));
            }
            const buffer =
              (await info.fileList[0].originFileObj?.arrayBuffer()) as ArrayBuffer;
            setFileName(info.fileList[0]?.name || "");
            setWord(buffer);
          }}
        >
          <div style={{ flex: 1 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">上传或者拖拽word模板</p>
          </div>
        </Upload.Dragger>
        <div className="upload_space"></div>
        <Upload.Dragger
          className="merge_upload"
          maxCount={1}
          accept=".xlsx"
          beforeUpload={() => false}
          onChange={async (info) => {
            if (!info.fileList.length) {
              return setExcel([]);
            }
            const buffer =
              (await info.fileList[0].originFileObj?.arrayBuffer()) as ArrayBuffer;
            setExcel(xlsx.parse(buffer));
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">上传或者拖拽Excel数据</p>
        </Upload.Dragger>
      </div>
      <Card
        title="文件名替换规则"
        size="small"
        extra={
          <Space>
            <Button>获取当前Word文件名</Button>
            <Button>清除</Button>
            <Button onClick={mergeFile} type="primary">
              生成文件
            </Button>
          </Space>
        }
      >
        <p>示例：{"给{姓名}家长的一封信.docx-->给张三家长的一封信.docx"}</p>
        <Input
          value={fileName}
          onInput={(e: any) => setFileName(e.target.value)}
        />
      </Card>
      <p></p>
      <Card title="替换规则说明" size="small">
        <Image src={mergeDemo} />
        <p style={{ fontWeight: "bold", fontSize: 18 }}>说明：</p>
        <p>
          {
            "需要替换的关键字用英文输入法的大括号扩起来，例如：给{姓名}家长的一封信 => 给张三家长的一封信"
          }
        </p>
        <p>条件判断：</p>
        <p>
          {
            '{#条件}条件符合会展示的东西{/}。"{#条件}"是条件开始；"{/}"是条件结束'
          }
        </p>
      </Card>
    </div>
  );
}
export default Merge;
