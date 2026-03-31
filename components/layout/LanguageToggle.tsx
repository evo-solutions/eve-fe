"use client";

import { Button } from "antd";
import { useLocale } from "next-intl";
import { locales, type Locale } from "@/libs/i18n/config";
import { useRouter } from "next/navigation";

const languageFlags: Record<Locale, string> = {
  vi: "🇻🇳",
  en: "🇬🇧",
};

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter();

  const toggleLocale = locales.find((loc) => loc !== locale)

  const handleLanguageChange = () => {
    document.cookie = `NEXT_LOCALE=${toggleLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Button
      type="text"
      onClick={handleLanguageChange}
      size="large"
    >
      {languageFlags[toggleLocale as Locale]}
    </Button>
  );
}

