import { VerticalAlignTopOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
const styles: React.CSSProperties = {
  position: "fixed",
  bottom: 60,
  right: 10,
  opacity: 0.8,
};
function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const main = document.getElementById("main") as HTMLElement;
    main.addEventListener("scroll", function (e: any) {
      const sc = e.target?.scrollTop;
      setShow(sc > 300);
    });
  }, []);
  function toTop() {
    document.getElementById("main")?.scroll(0, 0);
  }
  return (
    <div style={{ ...styles, display: show ? "" : "none" }}>
      <Button
        icon={<VerticalAlignTopOutlined />}
        shape="circle"
        type="primary"
        onClick={toTop}
      />
    </div>
  );
}
export default ToTop;
