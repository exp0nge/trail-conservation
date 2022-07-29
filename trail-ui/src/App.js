import {
  PieChartOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Input, Card, Typography, Col, Row, Button, Divider, Skeleton, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
const { Title } = Typography;
const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;
const axios = require('axios');
const { Meta } = Card;

const backendBaseUrl = "https://trail-conservation.azurewebsites.net";

const onSearch = async (uniqueCode, setFoundData, setLookupCode) => {
  setLookupCode(true);
  let results = await listUploads(uniqueCode);
  console.log(results.data);
  let filtered = results.data.filtered;
  setLookupCode(false);
  if (filtered.length == 1) {
    console.log("filtered", filtered[0]);
    setFoundData(filtered[0]);
  }
};

const getNftImageUrl = async () => {
  const perPage = 10;
  const pageNumber = Math.floor(Math.random() * 10);
  const selection = Math.floor(Math.random() * 9);
  const imageResp = await axios
    .get(`${backendBaseUrl}/nfts/images?query=mountain&page=${pageNumber}&per_page=${perPage}`);
  return imageResp.data.photos[selection].src.medium;
}

const listAllNftsOwned = async () => {
  const url = `${backendBaseUrl}/nfts/owned?chain=rinkeby&include=metadata`;
  return axios.get(url);
}

const pollAndInflateNftCard = async (hash, setMintedCard, setMinting) => {
  console.log("begin polling for", hash);
  const mineUrl = `${backendBaseUrl}/nfts/mint/poll?hash=${hash}`
  axios.get(mineUrl)
    .then(async (minedInResp) => {
      console.log("minedInResp", minedInResp.data);
      const allNfts = await listAllNftsOwned();
      const minted = allNfts.data.nfts.filter(nft => nft["token_id"] == minedInResp.data["token_id"]);
      console.log("minted", minted);
      if (minted.length == 1) {
        if (minted[0]["file_url"]) {
          setMinting(false);
          setMintedCard(minted[0]);
        }
        else {
          console.log("file_url missing, trying again");
          setTimeout(() => pollAndInflateNftCard(hash, setMintedCard, setMinting), 3000);
        }
      } else {
        console.error("minted was not 1", minted);
      }
    })
    .catch(function (error) {
      console.log("axios err, will retry", error);
      setTimeout(() => pollAndInflateNftCard(hash, setMintedCard, setMinting), 5000);
    });

}

const mintNtf = async (form, uniqueCode, setMintHidden, setMintedCard, setMinting) => {
  console.log("form", form);
  setMinting(true);
  setMintHidden(true);
  console.log("mint with", uniqueCode)
  const mintUrl = `${backendBaseUrl}/nfts/mint`;
  const imgUrl = await getNftImageUrl();
  const mintResp = await axios.post(mintUrl, {
    uniqueCode: uniqueCode,
    imgUrl: imgUrl
  });

  setTimeout(() => pollAndInflateNftCard(mintResp.data["transaction_hash"], setMintedCard, setMinting), 5000);
};

// 122 222 34
async function listUploads(uniqueCode) {
  const requestURL = `${backendBaseUrl}/search?uniqueCode=${uniqueCode}`;
  return axios.get(requestURL);
};


function createNftCard(nftData) {
  return (
    <div>
      <br />
      <Card
        hoverable
        style={{ width: 720 }}
        cover={<img alt="example" src={nftData["file_url"]} />}
      >
        <Meta title={nftData["name"]} description={nftData["description"]} />
      </Card>
    </div>
  );
};



function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Mint', '1', <UserOutlined />),
  getItem('Trail Activity', '2', <PieChartOutlined />)
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [foundData, setFoundData] = useState(null);
  const [mintHidden, setMintHidden] = useState(false);
  const [mintedCard, setMintedCard] = useState(null);
  const [lookupCode, setLookupCode] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    localStorage.setItem("mintedCard", JSON.stringify(mintedCard));
  }, [mintedCard]);

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
            <Breadcrumb.Item>Mint</Breadcrumb.Item>
          </Breadcrumb>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
            <Row>
              <Col span={12}>
                <Title level={2}>Check In</Title>
                <span>Claim your Trail Completionist NFT. Enter the unique ID you have received from the trail checkpoint.</span>
                <Search placeholder="unique code" onSearch={v => onSearch(v, setFoundData, setLookupCode)} enterButton />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
              </Col>
            </Row>

            <Row>
              <Col span={12} offset={6}>
                {lookupCode && (
                  <div>
                    <br />
                    <Skeleton active />
                  </div>)
                }
                {foundData && (
                  <div>
                    <br />
                    <Card
                      title={`Unique Code: ${foundData["device_pinValue"]}`} bordered={true}
                    >
                      {`Created: ${foundData["device_dateCreated"]}`}
                      <Divider />
                      <Form
                        layout="vertical"
                        onFinish={form => mintNtf(form, foundData["device_pinValue"], setMintHidden, setMintedCard, setMinting)}
                        autoComplete="off"
                      >

                        <Form.Item
                          label="How difficult was this hike?"
                          name="difficulty"
                          rules={[
                            {
                              required: false,
                            }
                          ]}
                        >
                          <Input.TextArea />
                        </Form.Item>

                        <Form.Item
                          label="How was the road/trail condition? Any obstructions?"
                          name="condition"
                          rules={[
                            {
                              required: false
                            }
                          ]}
                        >
                          <Input.TextArea />
                        </Form.Item>

                        <Form.Item
                          label="On a scale of 1-10, how enjoyable was this hike?"
                          name="rating"
                          rules={[
                            {
                              required: false
                            }
                          ]}
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item>
                          <Button disabled={mintHidden} htmlType="submit" type="primary" shape="round" size={"large"}>
                            Mint!
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </div>)}
              </Col>
            </Row>
            <Row>
              <br />
              <Col span={6} offset={8}>
                {minting && (<div>
                  <br />
                  <Skeleton active />
                </div>)}
              </Col>
              <Col span={24} offset={6}>
                {mintedCard && createNftCard(mintedCard)}
              </Col>
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
};


export default App;