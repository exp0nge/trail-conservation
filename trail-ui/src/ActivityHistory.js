import {
  PieChartOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Input, Card, Space, Col, Row, Button, Divider, Skeleton, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;
const axios = require('axios');
const { Meta } = Card;

const fetchUsingCovalent = async (setHasData) => {
  const covalentUrl = "https://api.covalenthq.com/v1/137/tokens/0x1a61dd84d67228b04cf28542c9f492a07cc1a38a/nft_metadata/4752/?quote-currency=USD&format=JSON&key=ckey_e8bd44f22fcc42429d577e3aff6";
  const imageResp = await axios
    .get(covalentUrl,
      {
        headers: {
          "Content-Type": "application/json"
        }
      });
  const covalentResp = imageResp.data.data.items[0]["nft_data"][0]["external_data"];
  console.log("covalentResp", covalentResp);
  setHasData(covalentResp);
}

function createNftCard(nftData) {
  return (
    <div>
      <br />
      <Card
        hoverable
        style={{ width: 720 }}
        cover={<img alt="example" src={nftData["image_1024"]} />}
      >
        <Meta title={nftData["name"]} description={nftData["description"]} />
      </Card>
    </div>
  );
};

function ActivityHistory() {
  const [collapsed, setCollapsed] = useState(false);
  const [hasData, setHasData] = useState(null);


  useEffect(() => {
    fetchUsingCovalent(setHasData);
  });

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu
          theme="dark" defaultSelectedKeys={['2']} mode="inline">
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
            <Breadcrumb.Item>Activity</Breadcrumb.Item>
          </Breadcrumb>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
          {hasData && createNftCard(hasData)}
          {hasData && createNftCard(hasData)}
          {hasData && createNftCard(hasData)}
          {hasData && createNftCard(hasData)}

          </div>
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
