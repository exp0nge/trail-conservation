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

const backendBaseUrl = "https://trail-conservation.azurewebsites.net";

const listAllNftsOwned = async () => {
  const url = `${backendBaseUrl}/nfts/owned?chain=rinkeby&include=metadata`;
  return axios.get(url);
}

const fetchNfts = async (setHasData) => {
  const imageResp = await listAllNftsOwned()
  setHasData(imageResp.data.nfts.reverse());
}

function createNftCard(nftData) {
  return (
    <div>
      <Col offset={5} span={6}>
        <Card
          hoverable
          style={{ width: 300 }}
          cover={<img alt="example" src={nftData["file_url"]} />}
        >
          <Meta title={nftData["name"]} description={nftData["description"]} />
        </Card>
      </Col>
    </div>
  );
};

function ActivityHistory() {
  const [collapsed, setCollapsed] = useState(false);
  const [hasData, setHasData] = useState(null);


  useEffect(() => {
    fetchNfts(setHasData);
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
            <Row>
              {hasData && hasData.map(data => createNftCard(data))}
            </Row>
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
