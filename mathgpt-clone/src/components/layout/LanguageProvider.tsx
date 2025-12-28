"use client"

import * as React from "react"
import { I18nextProvider } from "react-i18next"
import i18n, { getStoredLanguage } from "@/lib/i18n"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const storedLang = getStoredLanguage()
    if (storedLang !== i18n.language) {
      i18n.changeLanguage(storedLang)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
