import { InboxOutlined } from "@ant-design/icons";
import { Button, Space, Upload } from "antd";
import Templatemode from "docxtemplater";
import FileSaver from "file-saver";
import JSZip from "jszip";
import xlsx from "node-xlsx";
import PizZip from "pizzip";
import React, { useState } from "react";

function Merge() {
  const [word, setWord] = useState<ArrayBuffer>(new ArrayBuffer(0));
  const [excel, setExcel] = useState<any[]>([]);
  return (
    <div>
      <div style={{ display: "flex", width: "100%" }}>
        <Upload.Dragger
          accept=".docx"
          beforeUpload={() => false}
          maxCount={1}
          onChange={async (info) => {
            if (!info.fileList.length) {
              return setWord(new ArrayBuffer(0));
            }
            const buffer =
              (await info.fileList[0].originFileObj?.arrayBuffer()) as ArrayBuffer;
            setWord(buffer);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">上传或者拖拽word模板</p>
        </Upload.Dragger>
        <Upload.Dragger
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
      <Button
        onClick={() => {
          const jsZip = new JSZip();
          const excelData = excel[0].data || [];
          const keys: string[] = excelData.shift();
          const values: any[][] = excelData;
          const p: any[] = [];
          values.forEach((v) => {
            const zip = new PizZip(word);
            const doc = new Templatemode(zip);
            let name = "";
            const data: Record<string, any> = {};
            keys.forEach((k, index) => {
              data[k] = v[index] || 0;
              if (k === "姓名") name = v[index];
            });
            doc.setData(data);
            console.log(data);
            doc.render();
            const buf = doc.getZip()?.generate({ type: "blob" }) as Blob;
            p.push({ buf, name: `给${name}家长的一封信.docx` });
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
        }}
      >
        按钮
      </Button>
    </div>
  );
}
export default Merge;
