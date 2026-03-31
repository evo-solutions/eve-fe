"use client";
import { useAuth } from "@/hooks/useAuth";
import { Dropdown, Space } from "antd";
import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
export const ProfileDropdown = () => {
    const { user } = useAuth();
    const router = useRouter();
    return (
        <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            styles={{
                root: {
                    width: 200,
                },
            }}
            menu={{
                items: [
                    {
                        key: "profile",
                        label: "Profile",
                        icon: <UserOutlined />,
                        onClick: () => {
                            router.push("/profile");
                        }
                    },
                    {
                        key: "settings",
                        label: "Settings",
                        icon: <SettingOutlined />,
                        onClick: () => {
                            router.push("/settings");
                        }
                    },
                    {
                        key: "divider",
                        type: "divider",
                    },
                    {
                        key: "logout",
                        label: "Logout",
                        danger: true,
                        icon: <LogoutOutlined />,
                        onClick: () => {
                            authService.logout();
                        }
                    },

                ]
            }}>
            <Space align="center" size={16}>
                <span>{user?.name}</span>
            </Space>
        </Dropdown>
    )
}