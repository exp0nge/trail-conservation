import {
    PieChartOutlined,
    UserOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Input, Card, Space, Col, Row, Button, Divider, Skeleton, Form } from 'antd';
import React, { useState } from 'react';
import { connect } from "@tableland/sdk";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;
const axios = require('axios');
const { Meta } = Card;


const tablelandTableName = "trail_conservation_hackfs";

const readTableland = async (name) => {
    const tableland = await connect({ network: "testnet" });

    const readRes = await tableland.read(`SELECT * FROM ${name};`);
    console.log("tableLandInit.readRes", readRes);
}
const tableLandInit = async () => {
    console.log("init tableland");

    const tableland = await connect({ network: "testnet" });
    const schema = `nft_id int, trail_id text, unique_code text, difficulty text, condition text, rating text, primary key (nft_id)`;
    console.log(schema);

    const { name } = await tableland.create(
        schema, // Table schema definition
        tablelandTableName // Optional `prefix` used to define a human-readable string
    );

    console.log("name", name);
    const writeRes = await tableland.write(`INSERT INTO ${name} (nft_id, trail_id, unique_code, difficulty, condition, rating) VALUES (0, '0', '1', 'easy', 'great', '10');`);
    console.log("writeRes", writeRes);
    await readTableland(name);
};


function Admin() {
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
                        <Breadcrumb.Item>Admin</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        className="site-layout-background"
                        style={{
                            padding: 24,
                            minHeight: 360,
                        }}
                    >
                        <Button onClick={tableLandInit}>Init Tableland</Button>
                        <Button onClick={readTableland}>Read Tableland</Button>
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

export default Admin;
