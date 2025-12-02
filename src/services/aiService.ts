import OpenAI from 'openai';
import axios from 'axios';
import prisma from '../config/database';

interface AIResponse {
    content: string;
    error?: string;
}

class AIService {
    private openaiClient: OpenAI | null = null;
    private openrouterApiKey: string | null = null;

    constructor() {
        // Initialize OpenAI client if key is available
        if (process.env.OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }

        // Store OpenRouter key if available
        if (process.env.OPENROUTER_API_KEY) {
            this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
        }
    }

    /**
     * Get AI configuration from database
     */
    async getConfig() {
        let config = await prisma.aIConfig.findFirst();

        // Create default config if none exists
        if (!config) {
            config = await prisma.aIConfig.create({
                data: {
                    isEnabled: false,
                    provider: 'openrouter',
                    model: 'z-ai/glm-4.5-air:free',
                    systemPrompt: 'You are a helpful customer support assistant.',
                    temperature: 0.7,
                    maxTokens: 500,
                },
            });
        }

        return config;
    }

    /**
     * Update AI configuration
     */
    async updateConfig(updates: {
        isEnabled?: boolean;
        provider?: string;
        model?: string;
        systemPrompt?: string;
        temperature?: number;
        maxTokens?: number;
    }) {
        const config = await this.getConfig();

        return await prisma.aIConfig.update({
            where: { id: config.id },
            data: updates,
        });
    }

    /**
     * Get conversation history for context
     */
    async getConversationHistory(sessionId: string, limit: number = 10) {
        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });

        return messages.reverse().map(msg => ({
            role: msg.senderType === 'user' ? 'user' : 'assistant',
            content: msg.message,
        }));
    }

    /**
     * Generate AI response using OpenAI
     */
    private async generateOpenAIResponse(
        messages: Array<{ role: string; content: string }>,
        config: any
    ): Promise<AIResponse> {
        debugger;
        if (!this.openaiClient) {
            return { content: '', error: 'OpenAI API key not configured' };
        }

        try {
            const completion = await this.openaiClient.chat.completions.create({
                model: config.model,
                messages: [
                    { role: 'system', content: config.systemPrompt },
                    ...messages,
                ] as any,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
            });

            return {
                content: completion.choices[0]?.message?.content || 'No response generated',
            };
        } catch (error: any) {
            console.error('OpenAI API error:', error);
            return {
                content: '',
                error: error.message || 'Failed to generate response',
            };
        }
    }

    /**
     * Generate AI response using OpenRouter
     */
    private async generateOpenRouterResponse(
        messages: Array<{ role: string; content: string }>,
        config: any
    ): Promise<AIResponse> {
        if (!this.openrouterApiKey) {
            return { content: '', error: 'OpenRouter API key not configured' };
        }

        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: config.model,
                    messages: [
                        { role: 'system', content: config.systemPrompt },
                        ...messages,
                    ],
                    temperature: config.temperature,
                    max_tokens: config.maxTokens,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openrouterApiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'Chatbot Support',
                    },
                }
            );

            return {
                content: response.data.choices[0]?.message?.content || 'No response generated',
            };
        } catch (error: any) {
            console.error('OpenRouter API error:', error);
            return {
                content: '',
                error: error.response?.data?.error?.message || error.message || 'Failed to generate response',
            };
        }
    }

    /**
     * Generate AI response based on configuration
     */
    async generateResponse(sessionId: string, userMessage: string): Promise<AIResponse> {
        const config = await this.getConfig();

        // Check if AI is enabled
        if (!config.isEnabled) {
            return { content: '', error: 'AI is not enabled' };
        }

        // Get conversation history for context
        const history = await this.getConversationHistory(sessionId);

        // Add current user message
        const messages = [
            ...history,
            { role: 'user', content: userMessage },
        ];

        // Generate response based on provider
        if (config.provider === 'openai') {
            return await this.generateOpenAIResponse(messages, config);
        } else if (config.provider === 'openrouter') {
            return await this.generateOpenRouterResponse(messages, config);
        } else {
            return { content: '', error: 'Invalid AI provider configured' };
        }
    }
}

export default new AIService();
