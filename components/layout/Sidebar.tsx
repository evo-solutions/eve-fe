"use client";

import { AppstoreOutlined, RobotOutlined, ShopOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

const menuItems = [
    { key: "/shops", icon: <ShopOutlined />, label: "Shops" },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Sider
            width={280}
            className="border-r border-border p-1 bg-background"
        >
            <Menu
                mode="inline"
                selectedKeys={[
                    pathname.startsWith("/shops")
                        ? "/shops"
                        : "",
                ]}
                items={menuItems}
                onClick={({ key }) => {
                    router.push(key);
                }}
                style={{ background: "transparent", borderInlineEnd: "none" }}
                className="uppercase text-primary font-bold"
            />
        </Sider>
    );
}
