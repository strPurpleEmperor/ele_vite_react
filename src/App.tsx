import "./App.scss";

import { AppstoreOutlined } from "@ant-design/icons";
import * as remote from "@electron/remote";
import { ConfigProvider, Layout, Menu, Spin } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import zhCN from "antd/locale/zh_CN";
import { useAtom } from "jotai";
import React, { Suspense, useEffect } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
const menu = remote.Menu;
const menuContextTemplate: any[] = [
  {
    label: "复制",
    role: "copy", // 快捷键与系统冲突时可以使用role属性指定
  },
  {
    label: "粘贴",
    role: "paste",
  },
];
const menuBuilder = menu.buildFromTemplate(menuContextTemplate);
import { collapsedVal, openKeysVal, selectedKeysVal } from "@/atom";
import ToTop from "@/component/ToTop";
import { router, RouteType } from "@/router";
function App() {
  useEffect(() => {
    window.addEventListener(
      "contextmenu",
      (e) => {
        console.log("鼠标点击了右键");
        e.preventDefault();
        menuBuilder.popup({
          window: remote.getCurrentWindow(),
        });
      },
      false
    );
  }, []);
  const [openKeys, setOpenKeys] = useAtom(openKeysVal);
  const [selectedKeys, setSelectedKeys] = useAtom(selectedKeysVal);
  const [collapsed, setCollapsed] = useAtom(collapsedVal);
  function clickMenuHandler(info: any) {
    const { key, keyPath } = info;
    console.log(key, keyPath);
    setSelectedKeys([key]);
  }
  function openChangeHandler(openKeys: string[]) {
    setOpenKeys(openKeys);
  }
  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ height: "100%" }}>
        <Layout.Sider
          collapsed={collapsed}
          collapsible
          onCollapse={() => setCollapsed(!collapsed)}
        >
          <Menu
            openKeys={openKeys}
            selectedKeys={selectedKeys}
            items={menuItems(router)}
            mode="inline"
            onClick={clickMenuHandler}
            onOpenChange={openChangeHandler}
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
            {rooterViews(router)}
            <Route
              path="*"
              element={<Navigate to="/pdf/get-url-list" />}
            ></Route>
          </Routes>
        </Layout.Content>
        <ToTop />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
function menuItems(routerItems?: RouteType[]): ItemType[] | undefined {
  if (routerItems && routerItems.length) {
    return routerItems.map((r) => {
      return {
        key: r.path,
        label: <Link to={r.path}>{r.name}</Link>,
        children: menuItems(r.children),
        icon: <AppstoreOutlined />,
      };
    });
  }
}
function rooterViews(routerItems?: RouteType[]) {
  if (routerItems && routerItems.length) {
    return routerItems.map(({ path, children, Component }) => {
      return (
        <Route
          path={path}
          key={path}
          element={
            Component && (
              <Suspense fallback={<Spin />}>
                <Component />
              </Suspense>
            )
          }
        >
          {rooterViews(children)}
        </Route>
      );
    });
  }
}
