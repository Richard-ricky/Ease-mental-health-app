// Speech Recognition Utilities
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class EnhancedSpeechRecognition {
  private recognition: any = null;
  private isListening = false;
  private options: SpeechRecognitionOptions;
  private restartTimeout: NodeJS.Timeout | null = null;
  private silenceTimeout: NodeJS.Timeout | null = null;

  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      ...options
    };

    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognitionHandlers();
  }

  private setupRecognitionHandlers() {
    if (!this.recognition) return;

    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.lang = this.options.language;
    this.recognition.maxAlternatives = this.options.maxAlternatives;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onStart?.();
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: any) => {
      this.clearSilenceTimeout();
      
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.options.onResult?.({
            transcript: transcript.trim(),
            confidence: confidence || 1,
            isFinal: true
          });
        } else {
          interimTranscript += transcript;
          this.options.onResult?.({
            transcript: transcript.trim(),
            confidence: confidence || 0.5,
            isFinal: false
          });
        }
      }

      // Set silence timeout for auto-stop
      if (this.options.continuous && finalTranscript) {
        this.setSilenceTimeout();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error occurred';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error - please check your connection';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied - please allow microphone permissions';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected - please try speaking closer to the microphone';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed - please check your microphone';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed - please try again';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      this.options.onError?.(errorMessage);
      
      // Attempt to restart on certain errors
      if (['network', 'service-not-allowed'].includes(event.error) && this.isListening) {
        this.scheduleRestart();
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.clearTimeouts();
      this.options.onEnd?.();
      console.log('Speech recognition ended');
      
      // Auto-restart if we were listening continuously
      if (this.options.continuous && this.restartTimeout === null) {
        this.scheduleRestart();
      }
    };
  }

  private setSilenceTimeout() {
    this.clearSilenceTimeout();
    this.silenceTimeout = setTimeout(() => {
      if (this.isListening) {
        this.stop();
      }
    }, 3000); // Stop after 3 seconds of silence
  }

  private clearSilenceTimeout() {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  private scheduleRestart() {
    this.clearTimeouts();
    this.restartTimeout = setTimeout(() => {
      if (!this.isListening) {
        this.start();
      }
    }, 1000);
  }

  private clearTimeouts() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    this.clearSilenceTimeout();
  }

  public start(): boolean {
    if (!this.recognition) {
      this.options.onError?.('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      console.warn('Speech recognition is already running');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.options.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.clearTimeouts();
    this.recognition.stop();
  }

  public abort() {
    if (!this.recognition) {
      return;
    }

    this.clearTimeouts();
    this.isListening = false;
    this.recognition.abort();
  }

  public isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public updateOptions(newOptions: Partial<SpeechRecognitionOptions>) {
    this.options = { ...this.options, ...newOptions };
    
    if (this.recognition) {
      this.recognition.continuous = this.options.continuous;
      this.recognition.interimResults = this.options.interimResults;
      this.recognition.lang = this.options.language;
      this.recognition.maxAlternatives = this.options.maxAlternatives;
    }
  }

  public destroy() {
    this.stop();
    this.clearTimeouts();
    this.recognition = null;
  }
}

// Helper function to check microphone permissions
export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission check failed:', error);
    return false;
  }
};

// Helper function to request microphone permission
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const hasPermission = await checkMicrophonePermission();
    if (hasPermission) {
      return true;
    }

    // If permission check failed, try to request it
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Failed to request microphone permission:', error);
    return false;
  }
};

// Export convenience functions
export const createSpeechRecognition = (options: SpeechRecognitionOptions) => {
  return new EnhancedSpeechRecognition(options);
};

export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
};