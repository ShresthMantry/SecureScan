import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// IMPORTANT: Replace with your actual API key or use environment variable
const API_KEY = 'AIzaSyBI8K0CUqe3Ypn0XznO8hXqfNSf-nnxKbE'; // Replace with your Gemini API key
const genAI = new GoogleGenerativeAI(API_KEY);

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  text: string;
  error?: string;
}

class AIService {
  private model;
  private chat: any;
  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor() {
    // Use Gemini 2.5 Flash model
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // System context for the chatbot
    const systemContext = `You are an AI assistant for SecureScan, a fraud detection mobile app. 
Your role is to help users understand:
- How to use the QR code scanner and link checker features
- Understanding fraud detection results (Phishing, Malware, Defacement, Benign)
- Best practices for online safety and fraud prevention
- Explaining threat levels and confidence scores
- General cybersecurity advice

Be helpful, concise, and friendly. If users ask about features outside of fraud detection and cybersecurity, 
politely redirect them to relevant security topics.`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemContext }],
    });
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: 'Hello! I\'m your SecureScan AI assistant. I\'m here to help you stay safe from online fraud and understand the app\'s features. How can I assist you today?' }],
    });
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      // Start or continue chat
      if (!this.chat) {
        this.chat = this.model.startChat({
          history: this.conversationHistory.slice(0, -1), // Exclude the last message
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        });
      }

      // Send message and get response
      const result = await this.chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text }],
      });

      return { text };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('API key')) {
        errorMessage = 'API key error. Please check the configuration.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      return {
        text: errorMessage,
        error: error.message,
      };
    }
  }

  resetConversation(): void {
    this.chat = null;
    this.conversationHistory = [];
    
    // Re-initialize with system context
    const systemContext = `You are an AI assistant for SecureScan, a fraud detection mobile app. 
Your role is to help users understand:
- How to use the QR code scanner and link checker features
- Understanding fraud detection results (Phishing, Malware, Defacement, Benign)
- Best practices for online safety and fraud prevention
- Explaining threat levels and confidence scores
- General cybersecurity advice

Be helpful, concise, and friendly.`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemContext }],
    });
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: 'Hello! I\'m your SecureScan AI assistant. How can I help you today?' }],
    });
  }

  getConversationHistory(): Array<{ role: string; parts: Array<{ text: string }> }> {
    return this.conversationHistory;
  }
}

export const aiService = new AIService();
