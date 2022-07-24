import {
  PieChartOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Input, Card, Space, Col, Row, Button, Divider, Skeleton, Form } from 'antd';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;
const axios = require('axios');
const { Meta } = Card;


function ActivityHistory() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu
          theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <PieChartOutlined />
            <span>Deshboard</span>
            <Link to="/" />
          </Menu.Item>
          <Menu.Item key="2">
            <UserOutlined />
            <span>Activity</span>
            <Link to="/activity" />
          </Menu.Item>
          <Menu.Item key="3">
            <SettingOutlined />
            <span>Admin</span>
            <Link to="/admin" />
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
          }}
        />
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item>Trail Conservation</Breadcrumb.Item>
            <Breadcrumb.Item>Acivity</Breadcrumb.Item>
          </Breadcrumb>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: 360,
            }}
          ></div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          @exp0nge | Hack.FS
        </Footer>
      </Layout>
    </Layout>
  );
}

export default ActivityHistory;
