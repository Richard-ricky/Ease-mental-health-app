/**
 * Microphone testing utilities for voice recording features
 */

export interface MicrophoneTestResult {
  hasPermission: boolean;
  isWorking: boolean;
  errorMessage?: string;
  deviceInfo?: {
    deviceId: string;
    label: string;
  }[];
}

export async function testMicrophoneAccess(): Promise<MicrophoneTestResult> {
  try {
    // Check if we're in a secure context
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      return {
        hasPermission: false,
        isWorking: false,
        errorMessage: 'Microphone access requires HTTPS or localhost'
      };
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        hasPermission: false,
        isWorking: false,
        errorMessage: 'Microphone access is not supported in this browser'
      };
    }

    // Try to get a media stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Get device information
    let deviceInfo: { deviceId: string; label: string; }[] = [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      deviceInfo = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`
        }));
    } catch (enumError) {
      console.warn('Could not enumerate devices:', enumError);
    }

    // Test if we can actually record audio
    let canRecord = false;
    try {
      const mediaRecorder = new MediaRecorder(stream);
      canRecord = true;
      mediaRecorder.stop();
    } catch (recordError) {
      console.warn('MediaRecorder test failed:', recordError);
    }

    // Clean up
    stream.getTracks().forEach(track => track.stop());

    return {
      hasPermission: true,
      isWorking: canRecord,
      deviceInfo,
      errorMessage: canRecord ? undefined : 'Microphone detected but recording may not work'
    };

  } catch (error) {
    let errorMessage = 'Unknown microphone error';
    
    if (error instanceof Error) {
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Microphone permission denied by user';
          break;
        case 'NotFoundError':
          errorMessage = 'No microphone found';
          break;
        case 'NotSupportedError':
          errorMessage = 'Microphone not supported';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Microphone constraints not supported';
          break;
        case 'NotReadableError':
          errorMessage = 'Microphone is being used by another application';
          break;
        case 'AbortError':
          errorMessage = 'Microphone request was cancelled';
          break;
        default:
          errorMessage = error.message || 'Microphone access failed';
      }
    }

    return {
      hasPermission: false,
      isWorking: false,
      errorMessage
    };
  }
}

export function getMicrophoneErrorSolution(errorMessage: string): string {
  if (errorMessage.includes('permission denied')) {
    return 'Click the microphone icon in your browser\'s address bar and select "Allow".';
  }
  if (errorMessage.includes('not found')) {
    return 'Please connect a microphone to your device and try again.';
  }
  if (errorMessage.includes('being used')) {
    return 'Close other applications that might be using your microphone (Zoom, Teams, etc.).';
  }
  if (errorMessage.includes('HTTPS')) {
    return 'This website needs to use HTTPS for microphone access. Try accessing via HTTPS.';
  }
  if (errorMessage.includes('not supported')) {
    return 'Try using a different browser like Chrome, Firefox, or Safari.';
  }
  return 'Try refreshing the page or restarting your browser.';
}

/**
 * Check if microphone access is possible without triggering permission prompts
 */
export function checkMicrophoneSupport(): { 
  isSupported: boolean; 
  isSecure: boolean; 
  errorMessage?: string 
} {
  // Check if we're in a secure context
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
  
  // Check if getUserMedia is supported
  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  let errorMessage: string | undefined;
  
  if (!isSecure) {
    errorMessage = 'Microphone access requires HTTPS or localhost';
  } else if (!isSupported) {
    errorMessage = 'Microphone access is not supported in this browser';
  }
  
  return {
    isSupported,
    isSecure,
    errorMessage
  };
}