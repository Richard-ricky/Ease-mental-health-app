// Text-to-Speech Utilities
export interface VoiceOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface SpeechOptions extends VoiceOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

export class EnhancedSpeechSynthesis {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private voicesCache: SpeechSynthesisVoice[] = [];
  private isAvailable = false;

  constructor() {
    // Check if we're in a browser environment and speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.synth = window.speechSynthesis;
        this.isAvailable = true;
        this.loadVoices();
        
        // Handle voices loaded event
        if (this.synth && typeof this.synth.onvoiceschanged !== 'undefined') {
          this.synth.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      } catch (error) {
        console.warn('Speech synthesis initialization failed:', error);
        this.isAvailable = false;
      }
    } else {
      console.warn('Speech synthesis not supported in this environment');
      this.isAvailable = false;
    }
  }

  private loadVoices() {
    if (!this.synth || !this.isAvailable) {
      this.voicesCache = [];
      return;
    }
    
    try {
      this.voicesCache = this.synth.getVoices();
    } catch (error) {
      console.warn('Failed to load voices:', error);
      this.voicesCache = [];
    }
  }

  public speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable || !this.synth) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      if (!text.trim()) {
        reject(new Error('No text provided for speech synthesis'));
        return;
      }

      // Cancel any current speech
      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice options
      this.applyVoiceOptions(utterance, options);

      // Set up event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.isPaused = false;
        const errorMessage = `Speech synthesis error: ${event.error}`;
        options.onError?.(errorMessage);
        reject(new Error(errorMessage));
      };

      utterance.onpause = () => {
        this.isPaused = true;
        options.onPause?.();
      };

      utterance.onresume = () => {
        this.isPaused = false;
        options.onResume?.();
      };

      if (options.onBoundary) {
        utterance.onboundary = options.onBoundary;
      }

      try {
        this.synth.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  public speakWithQueue(texts: string[], options: SpeechOptions = {}): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        for (const text of texts) {
          await this.speak(text, options);
          // Small delay between utterances
          await new Promise(res => setTimeout(res, 200));
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private applyVoiceOptions(utterance: SpeechSynthesisUtterance, options: VoiceOptions) {
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (options.lang) {
      // Find a voice that matches the language
      const matchingVoice = this.getVoiceByLanguage(options.lang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    utterance.rate = options.rate ?? 0.9; // Slightly slower for better comprehension
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 0.8;
    
    if (options.lang) {
      utterance.lang = options.lang;
    }
  }

  public pause() {
    if (this.isAvailable && this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.isAvailable && this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
    }
  }

  public cancel() {
    if (this.isAvailable && this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    // Refresh voices if cache is empty
    if (this.voicesCache.length === 0) {
      this.loadVoices();
    }
    return this.voicesCache;
  }

  public getVoiceByName(name: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return voices.find(voice => voice.name === name) || null;
  }

  public getVoiceByLanguage(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return voices.find(voice => voice.lang.startsWith(lang)) || null;
  }

  public getPreferredVoices(lang: string = 'en'): SpeechSynthesisVoice[] {
    const voices = this.getVoices();
    
    // Filter voices by language and prefer local voices
    const langVoices = voices.filter(voice => voice.lang.startsWith(lang));
    
    // Sort by local voices first, then by quality indicators
    return langVoices.sort((a, b) => {
      // Prefer local voices
      if (a.localService !== b.localService) {
        return a.localService ? -1 : 1;
      }
      
      // Prefer default voices
      if (a.default !== b.default) {
        return a.default ? -1 : 1;
      }
      
      // Prefer voices with certain quality indicators in name
      const qualityIndicators = ['premium', 'enhanced', 'neural', 'high quality'];
      const aHasQuality = qualityIndicators.some(indicator => 
        a.name.toLowerCase().includes(indicator)
      );
      const bHasQuality = qualityIndicators.some(indicator => 
        b.name.toLowerCase().includes(indicator)
      );
      
      if (aHasQuality !== bHasQuality) {
        return aHasQuality ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });
  }

  public getBestVoice(preferences: {
    lang?: string;
    gender?: 'male' | 'female';
    name?: string;
  } = {}): SpeechSynthesisVoice | null {
    const { lang = 'en', gender, name } = preferences;
    
    if (name) {
      const namedVoice = this.getVoiceByName(name);
      if (namedVoice) return namedVoice;
    }
    
    const preferredVoices = this.getPreferredVoices(lang);
    
    if (gender) {
      // Try to match gender based on common voice name patterns
      const genderFilteredVoices = preferredVoices.filter(voice => {
        const lowerName = voice.name.toLowerCase();
        if (gender === 'female') {
          return lowerName.includes('female') || 
                 lowerName.includes('woman') ||
                 ['samantha', 'alex', 'victoria', 'zira', 'hazel'].some(n => lowerName.includes(n));
        } else {
          return lowerName.includes('male') || 
                 lowerName.includes('man') ||
                 ['david', 'mark', 'daniel', 'tom'].some(n => lowerName.includes(n));
        }
      });
      
      if (genderFilteredVoices.length > 0) {
        return genderFilteredVoices[0];
      }
    }
    
    return preferredVoices[0] || null;
  }

  public isSupported(): boolean {
    return this.isAvailable;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  // Helper method to break long text into manageable chunks
  public breakIntoSentences(text: string): string[] {
    // Split by sentence-ending punctuation, keeping the punctuation
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    
    // Further break down very long sentences
    const maxLength = 200;
    const result: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.length <= maxLength) {
        result.push(sentence.trim());
      } else {
        // Break long sentences at commas or other natural breaks
        const chunks = sentence.split(/,(?=\s)/).reduce((acc: string[], chunk, index) => {
          if (index === 0) {
            acc.push(chunk.trim());
          } else {
            const lastChunk = acc[acc.length - 1];
            if (lastChunk.length + chunk.length <= maxLength) {
              acc[acc.length - 1] = lastChunk + ',' + chunk;
            } else {
              acc.push(chunk.trim());
            }
          }
          return acc;
        }, []);
        
        result.push(...chunks.map(chunk => chunk.trim()));
      }
    });
    
    return result.filter(s => s.length > 0);
  }
}

// Create singleton instance with lazy initialization
let speechSynthesisInstance: EnhancedSpeechSynthesis | null = null;

export const speechSynthesis = (() => {
  if (!speechSynthesisInstance) {
    speechSynthesisInstance = new EnhancedSpeechSynthesis();
  }
  return speechSynthesisInstance;
})();

// Export convenience functions
export const speakText = (text: string, options: SpeechOptions = {}) => {
  return speechSynthesis.speak(text, options);
};

export const speakWithAIVoice = async (text: string, voicePreference: 'male' | 'female' = 'female') => {
  const bestVoice = speechSynthesis.getBestVoice({ 
    lang: 'en-US', 
    gender: voicePreference 
  });
  
  return speechSynthesis.speak(text, {
    voice: bestVoice,
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  });
};

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.isSupported();
};

// Voice preset configurations
export const VoicePresets = {
  SAGE_COMPASSIONATE: {
    rate: 0.85,
    pitch: 1.1,
    volume: 0.9,
    gender: 'female' as const
  },
  SAGE_CALM: {
    rate: 0.8,
    pitch: 0.95,
    volume: 0.8,
    gender: 'female' as const
  },
  SAGE_ENERGETIC: {
    rate: 1.0,
    pitch: 1.2,
    volume: 0.9,
    gender: 'female' as const
  }
};