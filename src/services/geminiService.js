import { GoogleGenerativeAI } from '@google/generative-ai';

// REPLACE WITH YOUR ACTUAL GEMINI API KEY
// Get it FREE at: https://aistudio.google.com/app/apikey
const API_KEY = 'AIzaSyDtP1rEmb2r5d6AQdhOABpICnh18NUkCNg';

let genAI = null;

/**
 * Initialize Gemini AI
 */
const initializeGemini = () => {
    if (!genAI && API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        try {
            genAI = new GoogleGenerativeAI(API_KEY);
            console.log('✅ Gemini AI initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini:', error);
        }
    }
};

/**
 * Generate gift ideas using Gemini 2.0 Flash (FREE model)
 */
export const generateGiftIdeas = async (personData) => {
    try {
        console.log('🎁 Generating gift ideas with Gemini 2.0 Flash...');

        // Initialize if not already done
        initializeGemini();

        if (!genAI) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        // Use the FREE Gemini 2.0 Flash model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        // Build detailed prompt
        const prompt = buildPrompt(personData);

        console.log('📤 Sending request to Gemini...');

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log('📥 Response received from Gemini');
        console.log('Response length:', text.length, 'characters');

        // Parse the response into structured gift ideas
        const giftIdeas = parseGiftIdeas(text);

        if (giftIdeas.length === 0) {
            console.warn('⚠️ No gift ideas parsed, returning raw text');
            return {
                success: true,
                ideas: [{
                    id: Date.now(),
                    name: 'Gift Suggestions',
                    description: text,
                }],
                rawText: text,
            };
        }

        console.log('✅ Successfully generated', giftIdeas.length, 'gift ideas');

        return {
            success: true,
            ideas: giftIdeas,
            rawText: text,
        };

    } catch (error) {
        console.error('❌ Error generating gift ideas:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
        });

        // Handle specific error types
        if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
            return {
                success: false,
                error: 'Invalid API key. Please check your Gemini API key in geminiService.js',
                details: 'Get your free API key at: https://aistudio.google.com/app/apikey',
            };
        }

        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return {
                success: false,
                error: 'API quota exceeded. Please try again later.',
                details: 'The free tier has usage limits. Wait a few minutes and try again.',
            };
        }

        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            return {
                success: false,
                error: 'Network error. Please check your internet connection.',
            };
        }

        return {
            success: false,
            error: 'Failed to generate gift ideas. Please try again.',
            details: error.message,
        };
    }
};

/**
 * Build comprehensive prompt for Gemini
 */
const buildPrompt = (personData) => {
    const sections = [];

    if (personData.hobbies?.trim()) {
        sections.push(`Hobbies: ${personData.hobbies}`);
    }
    if (personData.occupation?.trim()) {
        sections.push(`Occupation: ${personData.occupation}`);
    }
    if (personData.interests?.trim()) {
        sections.push(`Interests: ${personData.interests}`);
    }
    if (personData.personality?.trim()) {
        sections.push(`Personality: ${personData.personality}`);
    }
    if (personData.favorites?.trim()) {
        sections.push(`Favorite Things: ${personData.favorites}`);
    }
    if (personData.age?.trim()) {
        sections.push(`Age: ${personData.age}`);
    }
    if (personData.budget?.trim()) {
        sections.push(`Budget: ${personData.budget}`);
    }

    const personInfo = sections.join('\n');

    return `You are a helpful gift advisor. Generate 8 creative and personalized gift ideas for someone with these details:

${personInfo}

Requirements:
- Provide EXACTLY 8 different gift ideas
- Make each gift thoughtful and personalized
- Include practical gifts that are actually available to buy
- Consider the budget if specified
- Mix different categories: physical items, experiences, subscriptions, etc.

Format EACH gift idea EXACTLY like this:
**Gift Name** - Description of the gift and why it's perfect for them (Price estimate if budget provided)

Start now with gift idea #1:`;
};

/**
 * Parse Gemini response into structured gift ideas
 */
const parseGiftIdeas = (text) => {
    console.log('🔍 Parsing gift ideas from response...');

    const ideas = [];
    const lines = text.split('\n');

    let currentIdea = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        // Check if line contains a gift (starts with number, **, or is bold)
        const isGiftLine =
            line.match(/^\d+[\.\)]\s/) ||           // "1. " or "1) "
            line.match(/^\*\*[^*]+\*\*/) ||         // "**Gift Name**"
            line.match(/^[A-Z][^:]*:\s/) ||         // "Gift Name: "
            (line.match(/^[A-Z]/) && line.length < 100 && !line.includes('.'));  // Short capitalized line

        if (isGiftLine) {
            // Save previous idea if exists
            if (currentIdea && currentIdea.name) {
                ideas.push(currentIdea);
            }

            // Clean the line
            let cleaned = line
                .replace(/^\d+[\.\)]\s*/, '')          // Remove numbering
                .replace(/^\*\*/g, '')                  // Remove opening **
                .replace(/\*\*$/g, '')                  // Remove closing **
                .replace(/^\*\s*/, '')                  // Remove starting *
                .trim();

            // Split name and description
            let name = cleaned;
            let description = '';

            if (cleaned.includes(' - ')) {
                const parts = cleaned.split(' - ');
                name = parts[0].trim();
                description = parts.slice(1).join(' - ').trim();
            } else if (cleaned.includes(': ')) {
                const parts = cleaned.split(': ');
                name = parts[0].trim();
                description = parts.slice(1).join(': ').trim();
            }

            currentIdea = {
                id: `gift-${Date.now()}-${Math.random()}`,
                name: name,
                description: description,
            };

            console.log(`  Found gift: "${name}"`);

        } else if (currentIdea && line.length > 10) {
            // Add to description if it's a continuation
            currentIdea.description += (currentIdea.description ? ' ' : '') + line;
        }
    }

    // Add last idea
    if (currentIdea && currentIdea.name) {
        ideas.push(currentIdea);
    }

    console.log(`📊 Parsed ${ideas.length} gift ideas`);

    return ideas;
};

/**
 * Validate API key
 */
export const validateApiKey = () => {
    const isValid = API_KEY &&
        API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' &&
        API_KEY.length > 20;

    console.log('🔑 API Key validation:', isValid ? 'VALID' : 'INVALID');

    return isValid;
};

/**
 * Test API connection
 */
export const testGeminiConnection = async () => {
    try {
        initializeGemini();

        if (!genAI) {
            return { success: false, error: 'API key not configured' };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Say "Hello, I am working!"');
        const response = result.response;
        const text = response.text();

        return { success: true, message: text };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
'AIzaSyDtP1rEmb2r5d6AQdhOABpICnh18NUkCNg'
