"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setLanguage, type Language } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const toggleLanguage = () => {
    const newLang: Language = i18n.language === "en" ? "zh" : "en"
    setLanguage(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {t(`language.${i18n.language}`)}
    </Button>
  )
}
