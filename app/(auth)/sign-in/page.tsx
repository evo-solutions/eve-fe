"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { AuthForm } from "@/components/auth/AuthForm";
import { authService } from "@/services/auth.service";

export default function SignIn() {
  const router = useRouter();
  const t = useTranslations("authentication");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.signIn({ email: email.trim(), password });
      router.push("/pages");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
          : undefined;
      setError(msg ?? t("authFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      email={email}
      password={password}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4 items-center justify-center">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          disabled={loading}
          className="w-full max-w-xs"
        >
          {t("signInButton")}
        </Button>
        <Link
          href="/sign-up"
          className="w-full max-w-xs text-center !text-foreground"
        >
          <p>
            {t("noAccountPrompt")}
            <span className="font-bold text-secondary"> {t("signUpButton")}</span>
          </p>
        </Link>
      </div>
    </AuthForm>
  );
}
