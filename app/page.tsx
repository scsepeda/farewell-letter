"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Heart, Languages, VolumeX, Pause, Play, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/useTranslation"
import { useTextToSpeech } from "@/lib/textToSpeech"

// Language configuration
const languages = [
  { code: "en", name: "English", flag: "US", abbrev: "US" },
  { code: "si", name: "Sinhala", flag: "LK", abbrev: "LK" },
  { code: "zh-CN", name: "简体中文", flag: "CN", abbrev: "CN" },
  { code: "fr", name: "Français", flag: "FR", abbrev: "FR" },
  { code: "ta", name: "தமிழ்", flag: "IN", abbrev: "IN" },
  { code: "hi", name: "हिन्दी", flag: "IN", abbrev: "IN" },
  { code: "tl", name: "Tagalog", flag: "PH", abbrev: "PH" },
]

export default function FarewellLetter() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const [showTagalogMessage, setShowTagalogMessage] = useState(false)
  const { t, isLoading } = useTranslation(currentLanguage)
  const tts = useTextToSpeech()

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!tts.isSupported()) {
        setTtsError("Text-to-speech is not supported in your browser")
      } else {
        setTtsError(null)
      }
    }
  }, [tts])

  useEffect(() => {
    if (currentLanguage === "tl") {
      const timer = setTimeout(() => {
        setShowTagalogMessage(true)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShowTagalogMessage(false)
    }
  }, [currentLanguage])

  const handleSpeak = async () => {
    if (!tts.isSupported()) {
      setTtsError("Text-to-speech is not supported in your browser")
      return
    }

    if (isSpeaking && !isPaused) {
      tts.pause()
      setIsPaused(true)
    } else if (isPaused) {
      tts.resume()
      setIsPaused(false)
    } else {
      const language = languages.find((lang) => lang.code === currentLanguage)
      const voiceCode =
        language?.code === "zh-CN"
          ? "zh-CN"
          : language?.code === "tl"
            ? "fil-PH"
            : `${language?.code}-${language?.flag}`

      const speakFunction = currentLanguage === "tl" ? tts.speakWithGoogleCloud : tts.speak

      const success = await speakFunction(
        t("letter"),
        voiceCode,
        {
          rate: 0.8,
          pitch: 1,
          volume: 1,
          ...(currentLanguage === "tl" && {
            voice: "fil-PH-Neural2-A",
            audioEncoding: "MP3",
          }),
        },
        {
          onStart: () => {
            setIsSpeaking(true)
            setIsPaused(false)
            setTtsError(null)
          },
          onEnd: () => {
            setIsSpeaking(false)
            setIsPaused(false)
          },
          onError: (error) => {
            setIsSpeaking(false)
            setIsPaused(false)
            setTtsError(error.message)
          },
          onPause: () => {
            setIsPaused(true)
          },
          onResume: () => {
            setIsPaused(false)
          },
        },
      )

      if (!success) {
        setTtsError("Failed to start text-to-speech")
      }
    }
  }

  const handleStop = () => {
    tts.stop()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  const handleLanguageChange = (langCode: string) => {
    if (isSpeaking) {
      handleStop()
    }
    setCurrentLanguage(langCode)
    setTtsError(null)
  }

  const renderTTSButton = () => {
    if (!tts.isSupported()) {
      return (
        <Button disabled variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
          <VolumeX className="h-4 w-4" />
          Not Supported
        </Button>
      )
    }

    if (isSpeaking && !isPaused) {
      return (
        <div className="flex gap-2">
          <Button onClick={handleSpeak} variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
            <Pause className="h-4 w-4" />
            {t("pause")}
          </Button>
          <Button onClick={handleStop} variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
            <VolumeX className="h-4 w-4" />
            {t("stop")}
          </Button>
        </div>
      )
    }

    if (isPaused) {
      return (
        <div className="flex gap-2">
          <Button onClick={handleSpeak} variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
            <Play className="h-4 w-4" />
            {t("resume")}
          </Button>
          <Button onClick={handleStop} variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
            <VolumeX className="h-4 w-4" />
            {t("stop")}
          </Button>
        </div>
      )
    }

    return (
      <Button onClick={handleSpeak} variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
        <Volume2 className="h-4 w-4" />
        {t("readAloud")}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center shadow-lg border-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <Languages className="h-8 w-8 text-teal-600" />
          </div>
          <p className="text-lg text-gray-600">{t("loading")}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <img src="/images/cacib-logo.png" alt="Crédit Agricole Corporate & Investment Bank" className="h-16 w-auto" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <a
            href="https://www.linkedin.com/in/scsepeda/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 py-4 shadow-lg border border-teal-600 transition-colors duration-200"
          >
            <img
              src="/images/samantha-profile.png"
              alt="Samantha Sepeda"
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <div className="text-left">
              <div className="font-semibold">Samantha Sepeda</div>
              <div className="text-sm text-teal-100">Connect on LinkedIn</div>
            </div>
          </a>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Till We Meet Again</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t("subtitle")}</p>
        </div>

        <Card className="p-8 shadow-lg bg-white border-0">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700">{t("selectLanguage")}</h2>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="outline"
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-3 text-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    currentLanguage === lang.code
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-lg"
                      : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="text-base font-bold">{lang.abbrev}</span>
                  <span className="text-xs font-medium leading-tight text-center">{lang.name}</span>
                  {lang.code === "tl" && currentLanguage === "tl" && (
                    <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-lg bg-white border-0">
          <div className="space-y-6">
            <div className="flex items-center justify-end">{renderTTSButton()}</div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{t("letter")}</p>
              </div>
            </div>

            {currentLanguage === "tl" && showTagalogMessage && (
              <div className="mt-6 p-6 bg-pink-50 border border-pink-200 rounded-xl animate-fade-in shadow-sm">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <Heart className="h-5 w-5 text-pink-500" />
                  </div>
                  <p className="text-base font-medium text-pink-700">{t("hiddenMessage")}</p>
                  <p className="text-sm text-pink-600 italic">{t("hiddenMessageTranslation")}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-1">
            <span className="text-base text-gray-600">Made with care for friends and colleagues around the world</span>
          </div>
          <p className="text-sm text-pink-600">
            📖 Check the{" "}
            <a
              href="https://github.com/scsepeda/farewell-letter-page/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pink-700 font-medium"
            >
              README file
            </a>{" "}
            for special shoutouts to some of my amazing colleagues!
          </p>
          <p className="text-xs text-gray-400">Built with Next.js, TailwindCSS, and CACIB design principles</p>
        </div>
      </div>
    </div>
  )
}
