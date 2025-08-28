"use client"

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

export interface GoogleCloudTTSOptions {
  voice?: string
  audioEncoding?: "MP3" | "LINEAR16" | "OGG_OPUS"
}

export interface TTSCallbacks {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
  onPause?: () => void
  onResume?: () => void
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
    }
  }

  private loadVoices() {
    if (!this.synthesis) return

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices()
      this.isInitialized = true
    }

    // Load voices immediately if available
    updateVoices()

    // Also listen for the voiceschanged event (some browsers need this)
    this.synthesis.addEventListener("voiceschanged", updateVoices)
  }

  private findBestVoice(language: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null

    console.log(`[v0] Finding voice for language: ${language}`)
    console.log(
      `[v0] Available voices:`,
      this.voices.map((v) => `${v.name} (${v.lang})`),
    )

    // Try to find exact language match with female voice preference
    let femaleVoices = this.voices.filter((v) => v.lang === language && this.isFemaleVoice(v))
    console.log(
      `[v0] Female voices for ${language}:`,
      femaleVoices.map((v) => v.name),
    )
    if (femaleVoices.length > 0) {
      console.log(`[v0] Selected female voice: ${femaleVoices[0].name}`)
      return femaleVoices[0]
    }

    // Try to find language family match (e.g., 'en' for 'en-US') with female preference
    const langFamily = language.split("-")[0]
    femaleVoices = this.voices.filter((v) => v.lang.startsWith(langFamily) && this.isFemaleVoice(v))
    console.log(
      `[v0] Female voices for ${langFamily} family:`,
      femaleVoices.map((v) => v.name),
    )
    if (femaleVoices.length > 0) {
      console.log(`[v0] Selected female voice from family: ${femaleVoices[0].name}`)
      return femaleVoices[0]
    }

    const nonMaleVoices = this.voices.filter((v) => {
      const matchesLang = v.lang === language || v.lang.startsWith(langFamily)
      const isNotMale = !this.isMaleVoice(v)
      return matchesLang && isNotMale
    })

    if (nonMaleVoices.length > 0) {
      console.log(`[v0] Selected non-male voice: ${nonMaleVoices[0].name}`)
      return nonMaleVoices[0]
    }

    // If no female voice for exact match, try any voice for exact language
    let voice = this.voices.find((v) => v.lang === language)
    if (voice) {
      console.log(`[v0] Selected exact language match: ${voice.name}`)
      return voice
    }

    // Fallback to any voice in language family
    voice = this.voices.find((v) => v.lang.startsWith(langFamily))
    if (voice) {
      console.log(`[v0] Selected language family match: ${voice.name}`)
      return voice
    }

    // Final fallback to default voice
    const fallback = this.voices.find((v) => v.default) || this.voices[0] || null
    console.log(`[v0] Selected fallback voice: ${fallback?.name}`)
    return fallback
  }

  private isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
    const name = voice.name.toLowerCase()

    const femaleIndicators = [
      "female",
      "woman",
      "girl",
      "lady",
      // Microsoft voices - female names
      "zira",
      "cortana",
      "hazel",
      "susan",
      "linda",
      "heather",
      "julie",
      "catherine",
      "aria",
      "jenny",
      "nancy",
      "michelle",
      "amber",
      "eva",
      "ivy",
      "joanna",
      "kendra",
      "kimberly",
      "salli",
      "nicole",
      "russell",
      "amy",
      "emma",
      "olivia",
      "ava",
      "isabella",
      "sophia",
      "charlotte",
      "mia",
      "amelia",
      "harper",
      "evelyn",
      // International female names
      "alice",
      "anna",
      "bella",
      "claire",
      "diana",
      "emma",
      "fiona",
      "grace",
      "helen",
      "iris",
      "jane",
      "karen",
      "laura",
      "maria",
      "nina",
      "olivia",
      "paula",
      "rachel",
      "sarah",
      "tessa",
      "victoria",
      "wendy",
      "zoe",
      "amelie",
      "celine",
      "marie",
      "nora",
      "sophie",
      "chloe",
      "lily",
      "zara",
      "elena",
      "lucia",
      "carmen",
      "rosa",
      "ana",
      "isabella",
      "gabriela",
      "sofia",
      "valentina",
      "camila",
      "natalia",
      "kyoko",
      "yuki",
      "haruka",
      "sakura",
      "mei",
      "rin",
      "hana",
      "aoi",
      "xiaoli",
      "meiling",
      "huifen",
      "jing",
      "li",
      "ming",
      "wei",
      "yan",
      "priya",
      "kavya",
      "ananya",
      "shreya",
      "riya",
      "aditi",
      "pooja",
      "samantha",
      "allison",
      "serena",
      "veena",
      "kanya",
      "lekha",
      "nicky",
      "flo",
      "audrey",
      "aurelie",
      "lea",
      "manon",
      "charlotte",
      "chiara",
      "federica",
      "giulia",
      "paola",
      "silvia",
      "monica",
      "luciana",
      // Filipino female names
      "blessica",
      "rosa",
      "maria",
      "ana",
      "luz",
      "carmen",
      "esperanza",
      "remedios",
      "josefa",
      "trinidad",
      "dolores",
      "concepcion",
      "pilar",
      // Sinhala female names
      "thilini",
      "kumari",
      "sujatha",
      "chamari",
      "dilani",
      "nayani",
      // Chinese female names
      "xiaoxiao",
      "xiaoyi",
      "yunxia",
      "xiaomo",
      "xiaochen",
      "xiaorui",
      // Tamil female names
      "pallavi",
      "kalpana",
      "shruti",
      "meera",
      "priya",
      "kavitha",
      // Hindi female names
      "swara",
      "madhur",
      "aditi",
      "kavya",
      "shreya",
      "ananya",
    ]

    const maleIndicators = [
      "male",
      "man",
      "boy",
      "guy",
      // Microsoft voices - male names
      "david",
      "mark",
      "richard",
      "george",
      "frank",
      "james",
      "paul",
      "ryan",
      "adam",
      "brian",
      "sean",
      "kevin",
      "justin",
      "matthew",
      "andrew",
      "daniel",
      "michael",
      "christopher",
      "anthony",
      "william",
      "robert",
      "thomas",
      "charles",
      "joseph",
      "john",
      "steven",
      "kenneth",
      "joshua",
      "edward",
      "benjamin",
      "samuel",
      "gregory",
      "raymond",
      "alexander",
      "patrick",
      "jack",
      "dennis",
      "jerry",
      "tyler",
      "aaron",
      // International male names
      "alex",
      "diego",
      "jorge",
      "carlos",
      "antonio",
      "francisco",
      "jose",
      "manuel",
      "pedro",
      "ricardo",
      "fernando",
      "alberto",
      "roberto",
      "eduardo",
      "alejandro",
      "javier",
      "miguel",
      "angel",
      "luis",
      "rafael",
      "pablo",
      "sergio",
      "adrian",
      "ivan",
      "oscar",
      "ruben",
      "victor",
      "marco",
      "lorenzo",
      "giovanni",
      "francesco",
      "alessandro",
      "matteo",
      "luca",
      "giuseppe",
      "stefano",
      "fabio",
      "claudio",
      // Filipino male names
      "angelo",
      "jose",
      "juan",
      "miguel",
      "antonio",
      "carlos",
      "rafael",
      "fernando",
      "eduardo",
      "ricardo",
      "alberto",
      "francisco",
      "manuel",
      // Sinhala male names
      "sameera",
      "kumara",
      "pradeep",
      "chaminda",
      "nuwan",
      "roshan",
      // Chinese male names
      "yunyang",
      "yunjian",
      "yunxi",
      "xiaobei",
      "xiaogang",
      "xiaolei",
      // Tamil male names
      "valluvar",
      "anand",
      "karthik",
      "ravi",
      "suresh",
      "kumar",
      // Hindi male names
      "madhur",
      "aditya",
      "arjun",
      "dev",
      "karan",
      "rohan",
    ]

    // Check for explicit female indicators first
    if (femaleIndicators.some((indicator) => name.includes(indicator))) {
      return true
    }

    // Check for explicit male indicators
    if (maleIndicators.some((indicator) => name.includes(indicator))) {
      return false
    }

    return false
  }

  private isMaleVoice(voice: SpeechSynthesisVoice): boolean {
    const name = voice.name.toLowerCase()

    const maleIndicators = [
      "male",
      "man",
      "boy",
      "guy",
      // Microsoft voices - male names
      "david",
      "mark",
      "richard",
      "george",
      "frank",
      "james",
      "paul",
      "ryan",
      "adam",
      "brian",
      "sean",
      "kevin",
      "justin",
      "matthew",
      "andrew",
      "daniel",
      "michael",
      "christopher",
      "anthony",
      "william",
      "robert",
      "thomas",
      "charles",
      "joseph",
      "john",
      "steven",
      "kenneth",
      "joshua",
      "edward",
      "benjamin",
      "samuel",
      "gregory",
      "raymond",
      "alexander",
      "patrick",
      "jack",
      "dennis",
      "jerry",
      "tyler",
      "aaron",
      // International and regional male names
      "alex",
      "diego",
      "jorge",
      "carlos",
      "antonio",
      "francisco",
      "jose",
      "manuel",
      "pedro",
      "ricardo",
      "fernando",
      "alberto",
      "roberto",
      "eduardo",
      "alejandro",
      "javier",
      "miguel",
      "angel",
      "luis",
      "rafael",
      "pablo",
      "sergio",
      "adrian",
      "ivan",
      "oscar",
      "ruben",
      "victor",
      "marco",
      "lorenzo",
      "giovanni",
      "francesco",
      "alessandro",
      "matteo",
      "luca",
      "giuseppe",
      "stefano",
      "fabio",
      "claudio",
      // Filipino male names
      "angelo",
      "jose",
      "juan",
      "miguel",
      "antonio",
      "carlos",
      "rafael",
      "fernando",
      "eduardo",
      "ricardo",
      "alberto",
      "francisco",
      "manuel",
      // Sinhala male names
      "sameera",
      "kumara",
      "pradeep",
      "chaminda",
      "nuwan",
      "roshan",
      // Chinese male names
      "yunyang",
      "yunjian",
      "yunxi",
      "xiaobei",
      "xiaogang",
      "xiaolei",
      // Tamil male names
      "valluvar",
      "anand",
      "karthik",
      "ravi",
      "suresh",
      "kumar",
      // Hindi male names
      "madhur",
      "aditya",
      "arjun",
      "dev",
      "karan",
      "rohan",
    ]

    return maleIndicators.some((indicator) => name.includes(indicator))
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  public isSupported(): boolean {
    return this.synthesis !== null
  }

  public speak(text: string, language: string, options: TTSOptions = {}, callbacks: TTSCallbacks = {}): boolean {
    if (!this.synthesis) {
      callbacks.onError?.(new Error("Text-to-speech is not supported in this browser"))
      return false
    }

    // Stop any ongoing speech
    this.stop()

    try {
      const utterance = new SpeechSynthesisUtterance(text)

      // Set voice
      const voice = this.findBestVoice(language)
      if (voice) {
        utterance.voice = voice
      }
      utterance.lang = language

      // Set options with defaults
      utterance.rate = options.rate ?? 0.8
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      // Set up event listeners
      utterance.onstart = () => {
        callbacks.onStart?.()
      }

      utterance.onend = () => {
        this.currentUtterance = null
        callbacks.onEnd?.()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        callbacks.onError?.(new Error(`Speech synthesis error: ${event.error}`))
      }

      utterance.onpause = () => {
        callbacks.onPause?.()
      }

      utterance.onresume = () => {
        callbacks.onResume?.()
      }

      this.currentUtterance = utterance
      this.synthesis.speak(utterance)
      return true
    } catch (error) {
      callbacks.onError?.(error as Error)
      return false
    }
  }

  public async speakWithGoogleCloud(
    text: string,
    language: string,
    options: TTSOptions & GoogleCloudTTSOptions = {},
    callbacks: TTSCallbacks = {},
  ): Promise<boolean> {
    // Only use Google Cloud TTS for Filipino
    if (language !== "fil-PH" && language !== "tl-PH") {
      return this.speak(text, language, options, callbacks)
    }

    try {
      callbacks.onStart?.()

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: "fil-PH",
          options: {
            voice: options.voice || "fil-PH-Neural2-D", // Female voice instead of A
            audioEncoding: options.audioEncoding || "MP3",
            rate: options.rate || 0.8,
            pitch: options.pitch || 1,
            volume: options.volume || 1,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate speech")
      }

      const data = await response.json()
      const audioContent = data.audioContent

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)

      audio.onended = () => {
        callbacks.onEnd?.()
      }

      audio.onerror = () => {
        callbacks.onError?.(new Error("Failed to play Google Cloud TTS audio"))
      }

      await audio.play()
      return true
    } catch (error) {
      console.log("[v0] Google Cloud TTS failed, falling back to browser TTS:", error)
      callbacks.onError?.(error as Error)
      // Fallback to browser TTS
      return this.speak(text, language, options, callbacks)
    }
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false
  }
}

// Create singleton instance
export const ttsService = new TextToSpeechService()

// Hook for React components
export function useTextToSpeech() {
  return {
    speak: ttsService.speak.bind(ttsService),
    speakWithGoogleCloud: ttsService.speakWithGoogleCloud.bind(ttsService),
    stop: ttsService.stop.bind(ttsService),
    pause: ttsService.pause.bind(ttsService),
    resume: ttsService.resume.bind(ttsService),
    isSpeaking: ttsService.isSpeaking.bind(ttsService),
    isPaused: ttsService.isPaused.bind(ttsService),
    isSupported: ttsService.isSupported.bind(ttsService),
    getAvailableVoices: ttsService.getAvailableVoices.bind(ttsService),
  }
}
