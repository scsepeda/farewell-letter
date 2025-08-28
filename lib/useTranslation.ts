"use client"
import { useState, useEffect } from "react"

type TranslationKey =
  | "title"
  | "subtitle"
  | "selectLanguage"
  | "yourLetter"
  | "readAloud"
  | "stopReading"
  | "loading"
  | "footerText"
  | "letter"
  | "hiddenMessage"
  | "hiddenMessageTranslation"
  | "pause"
  | "resume"
  | "stop"

type Translations = Record<TranslationKey, string>

const translations: Record<string, Translations> = {}

export function useTranslation(language = "en") {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTranslations, setCurrentTranslations] = useState<Translations | null>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      // Return cached translations if available
      if (translations[language]) {
        setCurrentTranslations(translations[language])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/translations/${language}.json`)
        if (response.ok) {
          const data = await response.json()
          translations[language] = data
          setCurrentTranslations(data)
        } else {
          // Fallback to English if translation not found
          if (language !== "en") {
            const fallbackResponse = await fetch("/translations/en.json")
            const fallbackData = await fallbackResponse.json()
            setCurrentTranslations(fallbackData)
          }
        }
      } catch (error) {
        console.error("Failed to load translations:", error)
        // Use English as ultimate fallback
        if (translations["en"]) {
          setCurrentTranslations(translations["en"])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  const t = (key: TranslationKey): string => {
    return currentTranslations?.[key] || key
  }

  return { t, isLoading }
}
