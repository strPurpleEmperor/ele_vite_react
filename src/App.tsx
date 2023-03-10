import "./App.scss";

import { Layout, Menu, Spin } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import React, { Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

import ToTop from "@/component/ToTop";
import { router, RouteType } from "@/router";
function App() {
  return (
    <Layout style={{ height: "100%" }}>
      <Layout.Sider>
        <Menu
          defaultOpenKeys={["/pdf"]}
          defaultSelectedKeys={["/pdf/get-url-list"]}
          items={menuItems(router)}
          mode="inline"
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
          <Route path="*" element={<Navigate to="/pdf/get-url-list" />}></Route>
        </Routes>
      </Layout.Content>
      <ToTop />
    </Layout>
  );
}

export default App;
function menuItems(routerItems?: RouteType[]): ItemType[] | undefined {
  if (routerItems && routerItems.length) {
    return routerItems.map((r) => {
      return {
        title: r.name,
        key: r.path,
        label: <Link to={r.path}>{r.name}</Link>,
        children: menuItems(r.children),
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
