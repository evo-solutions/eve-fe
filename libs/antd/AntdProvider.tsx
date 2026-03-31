"use client";

import { App, ConfigProvider, ThemeConfig, theme } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { useThemeContext } from "@/components/layout/ThemeToggle";
import { setGlobalMessageApi } from "./messageBridge";

interface AntdProviderProps {
  children: ReactNode;
}

const getPrimaryFromCSS = (): string => {
  if (typeof document === "undefined") return "#137fec";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  return value || "#137fec";
};

export function AntdProvider({ children }: AntdProviderProps) {
  const { theme: currentTheme } = useThemeContext();
  const [colorPrimary, setColorPrimary] = useState("#137fec");

  useEffect(() => {
    setColorPrimary(getPrimaryFromCSS());
  }, [currentTheme]);

  const lightTheme: ThemeConfig = {
    token: { colorPrimary },
    algorithm: theme.defaultAlgorithm,
  };

  const darkTheme: ThemeConfig = {
    ...lightTheme,
    algorithm: theme.darkAlgorithm,
  };

  const antdTheme = currentTheme === "dark" ? darkTheme : lightTheme;
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <AntdMessageRegistrar />
        {children}
      </App>
    </ConfigProvider>
  );
}

function AntdMessageRegistrar() {
  const { message } = App.useApp();

  useEffect(() => {
    setGlobalMessageApi(message);
  }, [message]);

  return null;
}

