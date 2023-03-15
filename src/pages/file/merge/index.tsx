import { Button, Space, Upload } from "antd";
import React from "react";

function Merge() {
  return (
    <div>
      <Space>
        <Upload maxCount={1}>
          <Button>上传模板word</Button>
        </Upload>
        <Upload maxCount={1}>
          <Button>上传Excel</Button>
        </Upload>
      </Space>
    </div>
  );
}
export default Merge;
