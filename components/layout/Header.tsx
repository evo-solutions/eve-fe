"use client";

import { useRouter } from "next/navigation";
import { Layout } from "antd";
import {
    LogoutOutlined,
} from "@ant-design/icons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
const { Header: AntHeader } = Layout;

interface HeaderProps {
    selectedConversationId?: string | null;
    onBackToList?: () => void;
}

export function Header({
}: HeaderProps) {
    const router = useRouter();
    const { user } = useAuth();
    const t = useTranslations();
    const handleLogout = () => {
        authService.logout();
        router.replace("/sign-in");
        router.refresh();
    };

    return (
        <AntHeader
            className="flex items-center justify-between !px-4 md:!px-6 !py-3 !bg-background shrink-0 border-b border-border"
        >
            <div className="flex items-center gap-2 text-primary uppercase text-lg font-bold">
                {t("app_title")}
            </div>
            <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center">
                    <ThemeToggle />
                    <LanguageToggle />
                </div>
                <div
                    className="flex items-center gap-2 cursor-pointer text-primary font-bold"
                    onClick={handleLogout}
                >
                    <LogoutOutlined />
                    <span>{user?.name ?? "User"}</span>
                </div>
            </div>
        </AntHeader>
    );
}
