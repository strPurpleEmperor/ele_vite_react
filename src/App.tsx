import "./App.scss";

import { Layout, Menu } from "antd";
import { Link, Navigate, Route, Routes } from "react-router-dom";

import ToTop from "@/component/ToTop";
import { router } from "@/router";
function App() {
  return (
    <Layout style={{ height: "100%" }}>
      <Layout.Sider>
        <Menu
          defaultSelectedKeys={["0"]}
          items={router.map((r, index) => ({
            title: r.name,
            key: index.toString(),
            label: <Link to={r.path}>{r.name}</Link>,
          }))}
          mode="vertical"
        ></Menu>
      </Layout.Sider>
      <Layout.Content
        id="main"
        style={{
          scrollBehavior: "smooth",
          padding: 12,
          backgroundColor: "white",
          overflow: "auto",
        }}
      >
        <Routes>
          {router.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
          <Route path="*" element={<Navigate to="/get-url-list" />} />
        </Routes>
      </Layout.Content>
      <ToTop />
    </Layout>
  );
}

export default App;
