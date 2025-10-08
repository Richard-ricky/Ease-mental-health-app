// Gemini AI API client
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
}

export interface ChatContext {
  messages: GeminiMessage[];
  systemPrompt?: string;
}

export interface MoodContext {
  recentMoods: number[];
  concerns: string[];
  goals: string[];
}

// Direct environment variable access with fallback
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || 'AIzaSyBHkAY-_GEA4WB9uiVUzFtaab9KTNLid8E';
// Remove unused GEMINI_MODEL constant

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Mental health-focused system prompt for Sage
const SAGE_SYSTEM_PROMPT = `You are Sage, a compassionate AI mental health companion for the Ease wellness app. Your role is to:

1. **Be Supportive & Empathetic**: Always respond with warmth, understanding, and validation
2. **Focus on Mental Wellness**: Provide practical coping strategies, mindfulness techniques, and emotional support
3. **Be Conversational**: Keep responses natural, engaging, and appropriately personal
4. **Encourage Professional Help**: When appropriate, gently suggest professional mental health resources
5. **Stay Safe**: Never provide medical diagnoses or replace professional therapy
6. **Be Concise**: Keep responses helpful but not overwhelming (2-4 sentences usually)
7. **Use Encouraging Language**: Be optimistic while acknowledging difficulties

Remember: You're talking to someone who may be struggling with mental health challenges. Be kind, patient, and genuinely caring in every response.`;

export class GeminiClient {
  private apiKey: string;
  private apiUrl: string;
  private isAvailable: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
    this.isAvailable = Boolean(this.apiKey && this.apiKey.length > 0);
    
    if (!this.isAvailable) {
      console.warn('Gemini API key not available - using fallback responses');
    }
  }

  async generateResponse(
    userMessage: string,
    context: ChatContext = { messages: [] },
    options: {
      temperature?: number;
      maxTokens?: number;
      includeSystemPrompt?: boolean;
    } = {}
  ): Promise<string> {
    // If API is not available, return fallback response
    if (!this.isAvailable) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 1000;
      const includeSystemPrompt = options.includeSystemPrompt !== false;

      // Build conversation history
      const messages: GeminiMessage[] = [];
      
      // Add system prompt as first user message if requested
      if (includeSystemPrompt && context.messages.length === 0) {
        messages.push({
          role: 'user',
          parts: [{ text: SAGE_SYSTEM_PROMPT }]
        });
        messages.push({
          role: 'model',
          parts: [{ text: "I understand. I'm Sage, your compassionate mental health companion. I'm here to listen, support, and help you on your wellness journey. How are you feeling today?" }]
        });
      }

      // Add conversation history
      messages.push(...context.messages);
      
      // Add current user message
      messages.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const requestBody = {
        contents: messages,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`;
        throw new Error(errorMessage);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      return responseText.trim();

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Provide fallback responses for common issues
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return this.getFallbackResponse(userMessage, 'api_key_error');
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          return this.getFallbackResponse(userMessage, 'quota_error');
        }
        if (error.message.includes('safety')) {
          return "I understand you're going through something difficult. While I can't respond to that specific message, I'm here to support you in other ways. Would you like to talk about what's on your mind?";
        }
      }
      
      return this.getFallbackResponse(userMessage, 'general_error');
    }
  }

  private getFallbackResponse(userMessage: string, errorType?: string): string {
    const responses = {
      greeting: [
        "Hello! I'm Sage, your AI companion. I'm here to listen and support you. How are you feeling today?",
        "Hi there! I'm here to help you on your wellness journey. What's on your mind?",
        "Welcome! I'm Sage, and I'm here to provide support and understanding. How can I help you today?"
      ],
      emotional_support: [
        "I hear you, and what you're feeling is valid. It takes courage to reach out, and I'm glad you're here.",
        "Thank you for sharing with me. Remember that you're not alone, and it's okay to not be okay sometimes.",
        "I'm here to listen and support you. Your feelings matter, and taking care of your mental health is important."
      ],
      general: [
        "I'm here to listen and support you. While I may not have all the answers, I want you to know that your feelings are valid.",
        "Thank you for trusting me with your thoughts. Remember that seeking support is a sign of strength, not weakness.",
        "I'm glad you're taking time to focus on your wellbeing. That's an important step toward feeling better."
      ],
      api_key_error: [
        "I'm having some technical difficulties right now, but I'm still here for you. Remember that you're not alone, and reaching out for support is always a good step."
      ],
      quota_error: [
        "I'm experiencing high demand right now, but I want you to know that your wellbeing matters. Consider talking to a friend, family member, or mental health professional."
      ],
      general_error: [
        "I'm having trouble connecting right now, but please don't let that stop you from seeking support. Your mental health is important."
      ]
    };

    // Simple keyword matching for fallback responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return responses.greeting[0];
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return responses.emotional_support[Math.floor(Math.random() * responses.emotional_support.length)];
    }
    
    if (errorType && responses[errorType as keyof typeof responses]) {
      const errorResponses = responses[errorType as keyof typeof responses];
      return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }
    
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  async generateStreamResponse(
    userMessage: string,
    context: ChatContext = { messages: [] },
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
      includeSystemPrompt?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const response = await this.generateResponse(userMessage, context, options);
      
      // Simulate streaming by sending chunks
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words.slice(0, i + 1).join(' ');
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for streaming effect
      }
    } catch (error) {
      throw error;
    }
  }

  // Helper method to build context from chat history
  buildContext(chatHistory: { role: 'user' | 'assistant'; content: string }[]): ChatContext {
    const messages: GeminiMessage[] = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    return { messages };
  }

  // Method to analyze sentiment and provide mental health insights
  async analyzeMoodAndProvideSupport(
    userMessage: string,
    moodContext?: MoodContext
  ): Promise<{
    response: string;
    suggestedActions: string[];
    moodInsight: string;
    supportLevel: 'low' | 'medium' | 'high' | 'crisis';
  }> {
    if (!this.isAvailable) {
      return this.getFallbackMoodAnalysis(userMessage);
    }

    try {
      let contextPrompt = '';
      if (moodContext) {
        contextPrompt = `
        Recent mood context:
        - Recent mood scores: ${moodContext.recentMoods.join(', ')} (1-10 scale)
        - Current concerns: ${moodContext.concerns.join(', ')}
        - Wellness goals: ${moodContext.goals.join(', ')}
      `;
      }

      const analysisPrompt = `
        ${SAGE_SYSTEM_PROMPT}
        
        ${contextPrompt}
        
        Please analyze this message and provide:
        1. A supportive response
        2. 2-3 specific actionable suggestions
        3. A brief mood insight
        4. Support level needed (low/medium/high/crisis)
        
        User message: "${userMessage}"
        
        Format your response as JSON:
        {
          "response": "your supportive response",
          "suggestedActions": ["action1", "action2", "action3"],
          "moodInsight": "brief insight about their emotional state",
          "supportLevel": "low|medium|high|crisis"
        }
      `;

      const result = await this.generateResponse(analysisPrompt, { messages: [] }, {
        temperature: 0.3, // Lower temperature for more consistent JSON
        includeSystemPrompt: false
      });

      try {
        const parsed = JSON.parse(result);
        return {
          response: parsed.response || "I'm here to support you through whatever you're experiencing.",
          suggestedActions: parsed.suggestedActions || ["Take a few deep breaths", "Consider talking to someone you trust"],
          moodInsight: parsed.moodInsight || "You're taking positive steps by reaching out.",
          supportLevel: parsed.supportLevel || 'medium'
        };
      } catch (_parseError) {
        // Fallback if JSON parsing fails
        return {
          response: result,
          suggestedActions: ["Take some time for self-care", "Consider reaching out to a friend or counselor"],
          moodInsight: "Every step towards better mental health matters.",
          supportLevel: 'medium'
        };
      }

    } catch (error) {
      console.error('Error in mood analysis:', error);
      return this.getFallbackMoodAnalysis(userMessage);
    }
  }

  private getFallbackMoodAnalysis(userMessage: string): {
    response: string;
    suggestedActions: string[];
    moodInsight: string;
    supportLevel: 'low' | 'medium' | 'high' | 'crisis';
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based mood detection
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die'];
    const highSupportKeywords = ['panic', 'can\'t cope', 'overwhelming', 'desperate'];
    const mediumSupportKeywords = ['anxious', 'worried', 'stressed', 'sad', 'depressed'];
    
    let supportLevel: 'low' | 'medium' | 'high' | 'crisis' = 'medium';
    let response = "I'm here to support you. Thank you for sharing with me.";
    let moodInsight = "You're taking a positive step by reaching out.";
    let suggestedActions = ["Take some deep breaths", "Practice self-compassion"];
    
    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      supportLevel = 'crisis';
      response = "I'm very concerned about what you've shared. Please reach out to a crisis hotline immediately at 988 or go to your nearest emergency room.";
      moodInsight = "You're going through an extremely difficult time.";
      suggestedActions = ["Call 988 immediately", "Go to emergency room", "Contact a trusted friend or family member"];
    } else if (highSupportKeywords.some(keyword => lowerMessage.includes(keyword))) {
      supportLevel = 'high';
      response = "I can hear that you're going through a really tough time. Your feelings are valid, and you don't have to face this alone.";
      moodInsight = "You're experiencing significant distress right now.";
      suggestedActions = ["Consider calling a mental health professional", "Practice grounding techniques", "Reach out to a trusted support person"];
    } else if (mediumSupportKeywords.some(keyword => lowerMessage.includes(keyword))) {
      supportLevel = 'medium';
      response = "I understand you're dealing with some difficult feelings. It's normal to have ups and downs, and I'm here to help.";
      moodInsight = "You're working through some challenging emotions.";
      suggestedActions = ["Try some mindfulness exercises", "Consider journaling", "Take a short walk outside"];
    } else {
      supportLevel = 'low';
      response = "Thank you for sharing with me. I'm here to listen and support you on your wellness journey.";
      moodInsight = "You're taking care of your mental health.";
      suggestedActions = ["Continue self-reflection", "Maintain healthy habits", "Stay connected with supportive people"];
    }
    
    return { response, suggestedActions, moodInsight, supportLevel };
  }

  public isApiAvailable(): boolean {
    return this.isAvailable;
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();

// Export helper functions
export const generateChatResponse = (message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) => {
  const context = geminiClient.buildContext(history);
  return geminiClient.generateResponse(message, context);
};

export const analyzeMoodWithAI = (message: string, moodContext?: MoodContext) => {
  return geminiClient.analyzeMoodAndProvideSupport(message, moodContext);
};

export const isGeminiAvailable = () => {
  return geminiClient.isApiAvailable();
};