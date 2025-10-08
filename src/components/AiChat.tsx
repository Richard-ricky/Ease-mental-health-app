import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Badge } from "./ui/badge.tsx";
import { Input } from "./ui/input.tsx";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Heart, 
  Sparkles, 
  Brain,
  MessageCircle,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { geminiClient, type ChatContext } from "../../utils/gemini/client.ts";
import { 
  extractFunctionCalls, 
  executeFunctionCall, 
  requestNotificationPermission,
  type FunctionCall 
} from "../../utils/ai/functionCalling.ts";
import { 
  EnhancedSpeechRecognition, 
  checkMicrophonePermission,
  requestMicrophonePermission,
  type SpeechRecognitionResult 
} from "../../utils/speech/recognition.ts";
import { 
  speechSynthesis, 
  speakWithAIVoice, 
  VoicePresets,
  isSpeechSynthesisSupported,
  type SpeechOptions 
} from "../../utils/speech/synthesis.ts";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  moodInsight?: string;
  suggestedActions?: string[];
  supportLevel?: 'low' | 'medium' | 'high' | 'crisis';
}

interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voicePreset: keyof typeof VoicePresets;
  rate: number;
  pitch: number;
  volume: number;
}

const SAGE_GREETING = "Hello! I'm Sage, your AI companion here at Ease. I'm here to listen, support, and help you on your mental wellness journey. How are you feeling today?";

const CONVERSATION_STARTERS = [
  "How are you feeling today?",
  "What's been on your mind lately?",
  "Tell me about your day",
  "What would help you feel better right now?",
  "I'm here to listen - what's going on?",
  "How can I support you today?"
];

interface AiChatProps {
  onSectionChange?: (section: string) => void;
  user?: any;
}

export function AiChat({ onSectionChange, user }: AiChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: SAGE_GREETING,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<EnhancedSpeechRecognition | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: isSpeechSynthesisSupported(),
    autoSpeak: isSpeechSynthesisSupported(),
    voicePreset: 'SAGE_COMPASSIONATE',
    rate: 0.85,
    pitch: 1.1,
    volume: 0.9
  });
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Don't check microphone permission on mount to avoid errors
    // Wait for user interaction instead
    setMicPermission(null);
    
    // Request notification permission safely
    requestNotificationPermission().catch(() => {
      // Ignore notification permission errors
    });
    
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const recognition = new EnhancedSpeechRecognition({
        language: 'en-US',
        continuous: false,
        interimResults: true,
        onResult: handleSpeechResult,
        onError: handleSpeechError,
        onStart: () => setIsListening(true),
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript("");
        }
      });
      setSpeechRecognition(recognition);
    }

    return () => {
      speechRecognition?.destroy();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-speak the first message
    if (messages.length === 1 && voiceSettings.enabled && voiceSettings.autoSpeak) {
      handleSpeakMessage(messages[0]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSpeechResult = (result: SpeechRecognitionResult) => {
    if (result.isFinal) {
      setInputMessage(prev => prev + result.transcript);
      setInterimTranscript("");
    } else {
      setInterimTranscript(result.transcript);
    }
  };

  const handleSpeechError = (error: string) => {
    console.error('Speech recognition error:', error);
    toast.error(error);
    setIsListening(false);
    setInterimTranscript("");
  };

  const toggleListening = async () => {
    if (!speechRecognition) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      return;
    }

    // Check microphone permission only when user clicks
    if (micPermission === null || micPermission === false) {
      try {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          setMicPermission(false);
          toast.error("Microphone permission is required for voice input", {
            description: "Please allow microphone access in your browser settings and try again."
          });
          return;
        }
        setMicPermission(true);
      } catch (error) {
        console.debug('Error requesting microphone permission:', error);
        setMicPermission(false);
        toast.error("Unable to access microphone", {
          description: "Please check your browser settings and try again."
        });
        return;
      }
    }

    try {
      const started = speechRecognition.start();
      if (!started) {
        toast.error("Unable to start voice recognition");
      }
    } catch (error) {
      console.debug('Error starting speech recognition:', error);
      toast.error("Unable to start voice recognition");
    }
  };

  const handleSpeakMessage = async (message: Message) => {
    if (!voiceSettings.enabled || message.role !== 'assistant') return;

    // Check if speech synthesis is available
    if (!isSpeechSynthesisSupported()) {
      toast.error("Speech synthesis is not supported in this browser");
      return;
    }

    try {
      setIsSpeaking(true);
      
      const preset = VoicePresets[voiceSettings.voicePreset];
      await speakWithAIVoice(message.content, preset.gender);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast.error("Unable to speak message");
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async (content: string = inputMessage) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Build conversation context from message history
      const conversationContext = messages
        .filter(msg => msg.id !== 'typing' && !msg.isTyping)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Call the backend AI chat endpoint
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info.tsx');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bba6a6a2/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          message: content,
          context: conversationContext,
          options: {
            temperature: 0.7,
            maxTokens: 1000,
            includeSystemPrompt: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse = await response.json();

      // Extract function calls from AI response
      const functionCalls = extractFunctionCalls(aiResponse.response || "");
      
      // Execute function calls
      let actionResults: string[] = [];
      for (const functionCall of functionCalls) {
        try {
          const result = await executeFunctionCall(functionCall, {
            setActiveSection: onSectionChange,
            user
          });
          if (result.success) {
            actionResults.push(`✅ ${result.message}`);
          } else {
            actionResults.push(`❌ ${result.message}`);
          }
        } catch (error) {
          console.error('Error executing function:', error);
          actionResults.push(`❌ Failed to execute ${functionCall.name}`);
        }
      }

      // Clean response text (remove function calls)
      let cleanResponse = aiResponse.response || "I'm here to help you with whatever you're going through.";
      const functionPattern = /\[FUNCTION:[^\]]+\]/g;
      cleanResponse = cleanResponse.replace(functionPattern, '').trim();

      // Add action results to response if any
      if (actionResults.length > 0) {
        cleanResponse += '\n\n' + actionResults.join('\n');
      }

      // Remove typing indicator and add response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if enabled
      if (voiceSettings.enabled && voiceSettings.autoSpeak) {
        setTimeout(() => {
          handleSpeakMessage(assistantMessage);
        }, 500);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. Remember, if you're in crisis, please reach out to a mental health professional or call 988.",
        timestamp: new Date(),
        supportLevel: 'high'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Unable to get response from AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: SAGE_GREETING,
      timestamp: new Date()
    }]);
    toast.success("Conversation cleared");
  };

  const getSupportLevelConfig = (level?: string) => {
    switch (level) {
      case 'crisis':
        return {
          color: 'from-red-500 to-pink-600',
          bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          icon: AlertTriangle
        };
      case 'high':
        return {
          color: 'from-orange-500 to-red-500',
          bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          icon: Heart
        };
      case 'medium':
        return {
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          icon: Brain
        };
      default:
        return {
          color: 'from-emerald-500 to-teal-600',
          bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-700',
          icon: Sparkles
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Bot className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Chat with Sage
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI mental health companion
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center space-x-4">
          <Badge className="text-white bg-gradient-to-r from-green-500 to-emerald-600">
            <Zap className="w-3 h-3 mr-1" />
            Powered by Gemini AI
          </Badge>
          
          {isSpeechSynthesisSupported() ? (
            voiceSettings.enabled && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 dark:border-purple-700 dark:text-purple-300">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice Enabled
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="text-gray-500 border-gray-300 dark:border-gray-700 dark:text-gray-500">
              <VolumeX className="w-3 h-3 mr-1" />
              Voice Not Supported
            </Badge>
          )}
          
          {micPermission && (
            <Badge variant="outline" className="text-blue-700 border-blue-300 dark:border-blue-700 dark:text-blue-300">
              <Mic className="w-3 h-3 mr-1" />
              Mic Ready
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
          <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span>Conversation</span>
                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Badge className="text-white bg-gradient-to-r from-purple-500 to-blue-600">
                      Speaking...
                    </Badge>
                  </motion.div>
                )}
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="h-8"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Voice Settings</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Enable Voice</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                          className="h-8"
                        >
                          {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auto-speak Responses</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                          className="h-8"
                          disabled={!voiceSettings.enabled}
                        >
                          {voiceSettings.autoSpeak ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Speech Recognition</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Microphone Status</span>
                        <Badge variant={micPermission ? "default" : "destructive"}>
                          {micPermission ? "Ready" : "Not Available"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <ScrollArea className="p-4 h-96">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-sm lg:max-w-md ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* Message bubble */}
                      <div className={`relative rounded-2xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white' 
                          : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm'
                      }`}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-purple-500 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ 
                                    duration: 1, 
                                    repeat: Infinity, 
                                    delay: i * 0.2 
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sage is typing...</span>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm leading-relaxed ${
                              message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {message.content}
                            </p>
                            
                            {/* Message actions */}
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-xs ${
                                message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                {message.role === 'assistant' && voiceSettings.enabled && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSpeakMessage(message)}
                                    className="w-6 h-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  className="w-6 h-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Support level indicator and insights */}
                      {message.role === 'assistant' && !message.isTyping && (message.moodInsight || message.suggestedActions) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-2"
                        >
                          {message.supportLevel && (
                            <div className="mb-2">
                              {(() => {
                                const config = getSupportLevelConfig(message.supportLevel);
                                const Icon = config.icon;
                                return (
                                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${config.bgColor} ${config.borderColor} border`}>
                                    <Icon className="w-3 h-3" />
                                    <span className="capitalize">{message.supportLevel} support</span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          
                          {message.moodInsight && (
                            <div className="mb-2 text-xs italic text-gray-600 dark:text-gray-400">
                              💡 {message.moodInsight}
                            </div>
                          )}
                          
                          {message.suggestedActions && message.suggestedActions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Suggested actions:</p>
                              {message.suggestedActions.map((action, index) => (
                                <div key={index} className="flex items-start space-x-1 text-xs text-gray-600 dark:text-gray-400">
                                  <span>•</span>
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'ml-3 order-3 bg-gray-200 dark:bg-gray-700' : 'mr-3 order-0 bg-gradient-to-br from-purple-500 to-blue-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
              {/* Conversation starters */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Quick starters:</p>
                  <div className="flex flex-wrap gap-2">
                    {CONVERSATION_STARTERS.slice(0, 3).map((starter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(starter)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {starter}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Speech recognition interim results */}
              {interimTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 mb-2 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Listening: "{interimTranscript}"
                  </p>
                </motion.div>
              )}

              {/* Input field */}
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="pr-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500 dark:focus:border-purple-400"
                  />
                  
                  {/* Voice input button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleListening}
                    disabled={!speechRecognition || isLoading}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                      isListening ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Send button */}
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="text-white shadow-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>

                {/* Stop speaking button */}
                {isSpeaking && (
                  <Button
                    variant="outline"
                    onClick={stopSpeaking}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}