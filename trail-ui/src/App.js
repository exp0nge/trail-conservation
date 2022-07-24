import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Input, Card, Space, Col, Row, Button, Divider, Skeleton, Form } from 'antd';
import React, { useState } from 'react';
const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;
const axios = require('axios');
const { Meta } = Card;

const dweb = (cid) => `https://${cid}.ipfs.dweb.link/`;
const onSearch = async (uniqueCode, setFoundData, setLookupCode) => {
  setLookupCode(true);
  let results = await listUploads();
  console.log(results.data);
  let files = await Promise.all(results.data.map(upload => axios.get(dweb(upload.cid))));
  console.log(files.map(resp => resp.data));
  let filtered = files.filter(resp => resp.data.device_pinValue.replaceAll(" ", "") === uniqueCode.replaceAll(" ", ""));
  setLookupCode(false);
  if (filtered.length == 1) {
    console.log("filtered", filtered[0].data);
    setFoundData(filtered[0].data);
  }
};

const getNftImageUrl = async () => {
  const perPage = 10;
  const pageNumber = Math.floor(Math.random() * 10);
  const selection = Math.floor(Math.random() * 9);
  const imageResp = await axios
    .get(`https://api.pexels.com/v1/search?query=mountain&page=${pageNumber}&per_page=${perPage}`,
      {
        headers: {
          "Authorization": "563492ad6f917000010000018b90ecadf3334968a540cc390fd35348"
        }
      });
  return imageResp.data.photos[selection].src.medium;
}

const listAllNftsOwned = async () => {
  return axios.get("https://api.nftport.xyz/v0/accounts/0x2028879b223444A417D239616fE060a15aef46A9?chain=rinkeby&include=metadata", {
    headers: {
      "Authorization": "6270fc9a-b98b-4f77-8b8e-f6f385ddc4a2"
    }
  });
}

const pollAndInflateNftCard = async (hash, setMintedCard, setMinting) => {
  console.log("begin polling for", hash);
  const mineUrl = `https://api.nftport.xyz/v0/mints/${hash}?chain=rinkeby`
  axios.get(mineUrl, {
    headers: {
      "Authorization": "6270fc9a-b98b-4f77-8b8e-f6f385ddc4a2"
    }
  })
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

const mintNtf = async (uniqueCode, setMintHidden, setMintedCard, setMinting) => {
  setMinting(true);
  setMintHidden(true);
  console.log("mint with", uniqueCode)
  const mintUrl = "https://api.nftport.xyz/v0/mints/easy/urls";
  const imgUrl = await getNftImageUrl();
  const data = {
    "chain": "rinkeby",
    "name": `Trail Completionist ${uniqueCode}`,
    "description": "A Trail Completionist NFT is awarded to those that volunteer to help sustain trails and report activity in them.",
    "file_url": imgUrl,
    "mint_to_address": "0x2028879b223444A417D239616fE060a15aef46A9"
  };

  const mintResp = await axios.post(mintUrl, data, {
    headers: {
      "Authorization": "6270fc9a-b98b-4f77-8b8e-f6f385ddc4a2"
    }
  });

  setTimeout(() => pollAndInflateNftCard(mintResp.data["transaction_hash"], setMintedCard, setMinting), 5000);
};

// 122 222 34
async function listUploads() {
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGEyMDk2ZmQ5RjZiNjM3NmQ0OEU0NzNCRDYzY0UwZDllODlkNmM0MDYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTg2MDgxMDUxMjIsIm5hbWUiOiJ3aW8ifQ.emRcF95reB9vkhFlKp_Y9dOPbr7nfncregQ4E1b2TVU';
  const requestURL = `https://api.web3.storage/user/uploads`;
  return axios.get(requestURL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
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

const createForm = () => {
  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Difficulty"
        name="difficulty"
        rules={[
          {
            required: false,
          }
        ]}
      >
        <Input.TextArea />
        <span>How difficult was this hike?</span>
      </Form.Item>

      <Form.Item
        label="Road Condition"
        name="condition"
        rules={[
          {
            required: false
          }
        ]}
      >
        <Input.TextArea />
        <span>How was the road/trail condition? Any obstructions?</span>
      </Form.Item>

      <Form.Item
        label="Rating"
        name="rating"
        rules={[
          {
            required: false
          }
        ]}
      >
        <Input />
        <span>On a scale of 1-10, how enjoyable was this hike?</span>
      </Form.Item>
    </Form>
  );
}

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

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
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
              <Col span={6}>
                <Search placeholder="input search text" onSearch={v => onSearch(v, setFoundData, setLookupCode)} enterButton />
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
                      {createForm()}
                      <Button disabled={mintHidden} type="primary" shape="round" size={"large"} onClick={() => mintNtf(foundData["device_pinValue"], setMintHidden, setMintedCard, setMinting)}>
                        Mint!
                      </Button>
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