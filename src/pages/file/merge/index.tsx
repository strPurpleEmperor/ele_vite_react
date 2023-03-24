import "./index.scss";

import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Modal,
  Select,
  Space,
  Upload,
} from "antd";
import { createReport } from "docx-templates";
import FileSaver from "file-saver";
import JSZip from "jszip";
import xlsx from "node-xlsx";
import React, { useEffect, useState } from "react";

import mergeDemo from "@/assets/merge_demo.png";
import { getFileType, RULES } from "@/tools";
import { Rule } from "@/types";

interface FormatRule extends Rule {
  name: string;
}

function Merge() {
  const [modalForm] = Form.useForm();
  const [word, setWord] = useState<ArrayBuffer>(new ArrayBuffer(0));
  const [excel, setExcel] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [keys, setKeys] = useState<string[]>([]);
  const [secureKeys, setSegueKeys] = useState<string[]>([]);
  const [formatRule, setFormatRule] = useState<FormatRule[]>([]);
  useEffect(() => {
    const excelData = JSON.parse(
      JSON.stringify(excel.length ? (excel[0].data as any) : [])
    );
    const keys: string[] = excelData.shift() || [];
    setKeys(keys);
  }, [excel]);
  useEffect(() => {
    setSegueKeys(keys.filter((k) => !formatRule.find((f) => f.name === k)));
  }, [keys, formatRule]);
  function mergeFile() {
    if (!excel.length || !word) return message.info("请先上传文件");
    const jsZip = new JSZip();
    const excelData = JSON.parse(JSON.stringify(excel[0].data || []));
    const keys: string[] = excelData.shift();
    const values: any[][] = excelData;
    const p: any[] = [];
    const nameMap: Record<string, number> = {};
    const formatMap: Record<string, any> = {};
    formatRule.forEach((f) => {
      formatMap[f.name] = f.rule;
    });
    values.forEach((v) => {
      const data: Record<string, any> = {};
      keys.forEach((k, index) => {
        const val = v[index];
        data[k] = formatMap[k] ? formatMap[k].rule(val) : val;
      });
      const buf = createReport({
        template: Buffer.from(word),
        cmdDelimiter: ["{", "}"],
        data,
      });
      let name = fileName.replace(/{([\W\w]+)}/g, function (match, $1) {
        return data[$1];
      });
      if (nameMap[name] !== void 0) {
        nameMap[name]++;
        const [oName, fileType] = getFileType(name);
        name = `${oName}(${nameMap[name]})${fileType}`;
      } else {
        nameMap[name] = 0;
      }
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
  function addRule() {
    Modal.confirm({
      icon: null,
      title: "配置",
      content: (
        <Form form={modalForm}>
          <Form.Item
            label="标题"
            name="name"
            rules={[{ required: true, message: "请选择标题" }]}
          >
            <Select>
              {secureKeys.map((s) => (
                <Select.Option key={s}>{s}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="格式化配置"
            name="ruleName"
            rules={[{ required: true, message: "请选择格式化内容" }]}
          >
            <Select>
              {RULES.map((s) => (
                <Select.Option key={s.ruleName}>{s.ruleName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        return modalForm.validateFields().then((res) => {
          const _f = [...formatRule];
          _f.push({
            name: res.name,
            ruleName: res.ruleName,
            rule: RULES.find((r) => r.ruleName === res.ruleName) as any,
          });
          setFormatRule(_f);
        });
      },
    });
  }
  function deleteRule(i: number) {
    const f = [...formatRule];
    f.splice(i, 1);
    setFormatRule(f);
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
      <Card title="格式化配置">
        {formatRule.map((f, index) => {
          return (
            <p key={f.name}>
              <span style={{ fontWeight: "bold" }}>{f.name}：</span>
              <span style={{ marginRight: 10 }}>{f.ruleName}</span>
              <Button
                onClick={() => deleteRule(index)}
                size="small"
                icon={<DeleteOutlined />}
                type="primary"
              />
            </p>
          );
        })}
        <Button onClick={addRule} type="primary">
          +
        </Button>
      </Card>
      <p></p>
      <Card
        title="文件名替换规则"
        extra={
          <Space>
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
      <Card title="替换规则说明">
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
            '{IF 条件}条件符合会展示的东西{END-IF}。"{IF 条件}"是条件开始(IF和条件之间要有一个空格)；"{END-IF}"是条件结束'
          }
        </p>
        <p>条件判断--并且：</p>
        <p>
          {
            '{IF 条件1 && 条件2 && 条件3}条件符合会展示的东西{END-IF}。"&&"是and，并且的意思，满足所有条件'
          }
        </p>
        <p>其他条件判断：</p>
        <p>{"条件1||条件2 -> 条件1或者条件2"}</p>
        <p>{"!条件 -> 非该条件"}</p>
        <p>{"条件 > 10 -> 条件大于10的时候"}</p>
        <p>{"条件 >= 10 -> 条件大于10的时候"}</p>
      </Card>
    </div>
  );
}
export default Merge;
