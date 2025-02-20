
declare namespace chrome.ai {
  interface LanguageDetectionResult {
    language: string;
  }

  interface LanguageDetection {
    detect(text: string): Promise<LanguageDetectionResult[]>;
  }

  interface Summarizer {
    summarize(text: string): Promise<string>;
  }

  interface Translator {
    translate(options: { text: string; targetLanguage: string }): Promise<{ text: string }>;
  }

  const languageDetection: LanguageDetection;
  const summarizer: Summarizer;
  const translator: Translator;
}