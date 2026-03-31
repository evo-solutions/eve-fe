"use client";

import { useTranslations } from "next-intl";
import { Form, Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

type AuthFormProps = {
  name?: string;
  email: string;
  password: string;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange?: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  children?: ReactNode;
};

export function AuthForm({
  name,
  email,
  password,
  error,
  onSubmit,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  children,
}: AuthFormProps) {
  const t = useTranslations("authentication");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-2xl rounded-2xl shadow-xl shadow-primary/20 p-8 backdrop-blur-sm mx-6">
        <Form
          layout="vertical"
          className="space-y-6"
          onSubmitCapture={onSubmit}
        >
          {onNameChange && (
            <Form.Item
              label={t("name")}
              name="name"
              rules={[{ required: true, message: t("nameRequired") }]}
            >
              <Input
                size="large"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                prefix={<UserOutlined />}
              />
            </Form.Item>
          )}

          <Form.Item
            label={t("email")}
            name="email"
            rules={[{ required: true, message: t("emailRequired") }]}
          >
            <Input
              type="email"
              size="large"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label={t("password")}
            name="password"
            rules={[{ required: true, message: t("passwordRequired") }]}
          >
            <Input.Password
              size="large"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              prefix={<LockOutlined />}
            />
          </Form.Item>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
          {children}
        </Form>
      </div>
    </div>
  );
}
