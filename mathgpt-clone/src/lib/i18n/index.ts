"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import zh from "./locales/zh.json"

export const defaultLanguage = "en"
export const languages = ["en", "zh"] as const
export type Language = (typeof languages)[number]

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

// Helper to get stored language
export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return defaultLanguage
  const stored = localStorage.getItem("language") as Language
  return languages.includes(stored) ? stored : defaultLanguage
}

// Helper to set language
export function setLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang)
  }
  i18n.changeLanguage(lang)
}
