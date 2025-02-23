export interface Message {
    id: string;
    text: string;
    detectedLanguage?: string;
    summary?: string;
    translation?: string;
    targetLanguage: string;
    isProcessing: boolean;
    error?: string;
  }
  
  export interface TranslatorInstance {
    translate(text: string): Promise<string>;
  }
  
  export interface DetectorInstance {
    detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
  }
  
  export const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'es', name: 'Spanish' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fr', name: 'French' },
  ];
  
  declare global {
    interface Window {
      ai: {
        translator: {
          create(options: { sourceLanguage: string; targetLanguage: string }): Promise<{
            translate(text: string): Promise<string>;
          }>;
        };
        languageDetector: {
          capabilities(): Promise<{ capabilities: 'no' | 'readily' | 'after-download' }>;
          create(options?: {
            monitor?: (monitor: {
              addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void;
            }) => void;
          }): Promise<{
            ready: Promise<void>;
            detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
          }>;
        };
        summarizer: {
          summarize(text: string, options?: { context: string }): Promise<string>;
        };
      };
    }
  }