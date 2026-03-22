const { GoogleGenAI } = require("@google/genai");

// Lazy initialization to ensure env vars are loaded
let genAI = null;

function getGenAI() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is not set in environment variables!");
            return null;
        }
        console.log("✅ Initializing Gemini AI with API key:", apiKey.substring(0, 10) + "...");
        genAI = new GoogleGenAI({ apiKey });
    }
    return genAI;
}

// Available models to try (in order of preference)
const AVAILABLE_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-001"
];

// System prompt for the Lumina AI Assistant
const SYSTEM_PROMPT = `You are **Lumina**, a friendly, knowledgeable, and helpful assistant. You can answer questions on ANY topic the user asks about.

**Your Strengths:**
- **GAD (Gender and Development)**: Gender equality, gender roles, LGBTQ+ awareness, women empowerment
- **VAWC (Violence Against Women and Children)**: RA 9262, abuse prevention, support resources, warning signs
- **Sex Education**: Reproductive health, consent, relationships, puberty, safe practices
- **General Knowledge**: Science, math, history, technology, coding, current events, and more!

**Guidelines:**
1. Be supportive, empathetic, and non-judgmental
2. Use simple, clear language appropriate for students
3. Provide accurate, helpful information on any topic
4. For emergencies or abuse situations, always recommend contacting authorities or helplines
5. Keep responses concise but comprehensive
6. Use bullet points and formatting for clarity when helpful
7. Be creative and helpful - answer whatever the user asks!

**Philippine Resources (for sensitive topics):**
- PNP Women's Desk: 117
- DSWD Hotline: (02) 931-8101
- CHR: (02) 294-8704
- Bantay Bata: 163`;

// Fallback responses when API is unavailable
const fallbackResponses = {
    gad: "**Gender and Development (GAD)** is about understanding how gender roles affect opportunities and responsibilities. It promotes equality between all genders in education, work, and society.\n\n**Key Points:**\n- Gender equality benefits everyone\n- Breaking stereotypes opens more opportunities\n- Everyone deserves respect regardless of gender",
    vawc: "**Violence Against Women and Children (VAWC)** refers to any act that causes physical, sexual, psychological, or economic harm.\n\n**In the Philippines:**\n- RA 9262 (Anti-VAWC Act) protects victims\n- Report to: PNP Women's Desk (117) or Barangay\n- DSWD Hotline: (02) 931-8101\n\n**Remember:** You are not alone. Help is available.",
    sex: "**Sex Education** teaches about human development, relationships, consent, and reproductive health.\n\n**Important Topics:**\n- Understanding your body\n- Healthy relationships\n- Consent and boundaries\n- Making informed decisions\n\nKnowledge empowers you to make safe choices.",
    greeting: "Mabuhay! 👋 I'm **Lumina**, your friendly assistant!\n\nI can help you with **any topic** - from GAD, VAWC, and Sex Education to science, math, coding, history, and more!\n\nWhat would you like to know?",
    default: "I'm currently experiencing technical difficulties. Please try again later, or contact your facilitator for immediate assistance.\n\n**Emergency Hotlines:**\n- PNP Women's Desk: 117\n- DSWD: (02) 931-8101"
};

// Quick reply suggestions based on topic
const quickReplies = {
    gad: ["What is gender equality?", "How to fight gender stereotypes?", "What are gender roles?"],
    vawc: ["What is RA 9262?", "How to report abuse?", "Signs of an abusive relationship"],
    sex: ["What is consent?", "How to have healthy relationships?", "Understanding puberty"],
    general: ["Tell me about GAD", "Help me with coding", "Explain something scientific", "What is VAWC?"]
};

function getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) return { reply: fallbackResponses.greeting, suggestions: quickReplies.general };
    if (lowerMsg.includes('gad') || lowerMsg.includes('gender')) return { reply: fallbackResponses.gad, suggestions: quickReplies.gad };
    if (lowerMsg.includes('vawc') || lowerMsg.includes('violence') || lowerMsg.includes('abuse')) return { reply: fallbackResponses.vawc, suggestions: quickReplies.vawc };
    if (lowerMsg.includes('sex') || lowerMsg.includes('reproductive') || lowerMsg.includes('consent')) return { reply: fallbackResponses.sex, suggestions: quickReplies.sex };
    return { reply: fallbackResponses.default, suggestions: quickReplies.general };
}

function getSuggestionsForMessage(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('gad') || lowerMsg.includes('gender')) return quickReplies.gad;
    if (lowerMsg.includes('vawc') || lowerMsg.includes('violence') || lowerMsg.includes('abuse')) return quickReplies.vawc;
    if (lowerMsg.includes('sex') || lowerMsg.includes('reproductive') || lowerMsg.includes('consent')) return quickReplies.sex;
    return quickReplies.general;
}

/**
 * Main chatbot endpoint - handles conversation with Gemini AI
 */
exports.askChatbot = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const ai = getGenAI();
        if (!ai) {
            console.error("❌ Gemini AI not initialized - API key missing");
            const fallback = getFallbackResponse(message);
            return res.json({ 
                success: true, 
                reply: fallback.reply + "\n\n*(AI service not configured)*",
                suggestions: fallback.suggestions,
                timestamp: new Date().toISOString(),
                fallback: true
            });
        }

        // Build conversation context from history
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-6);
            conversationContext = '\n\n**Recent Conversation:**\n' + 
                recentHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'Lumina'}: ${msg.text}`).join('\n');
        }

        const prompt = `${SYSTEM_PROMPT}${conversationContext}

**Student's Question:** ${message}

**Your Response:**`;

        // Try each model until one works
        let lastError = null;
        for (const modelName of AVAILABLE_MODELS) {
            try {
                console.log(`🤖 Trying model: ${modelName}`);
                
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: {
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 1024,
                    }
                });

                const text = response.text;
                
                if (text && text.trim().length > 0) {
                    console.log(`✅ Success with model: ${modelName}`);
                    const suggestions = getSuggestionsForMessage(message);
                    return res.json({ 
                        success: true, 
                        reply: text,
                        suggestions,
                        timestamp: new Date().toISOString(),
                        model: modelName
                    });
                }
            } catch (modelError) {
                console.error(`❌ Model ${modelName} failed:`, modelError.message);
                lastError = modelError;
                continue; // Try next model
            }
        }

        // All models failed
        throw lastError || new Error("All models failed to generate a response");

    } catch (error) {
        console.error("🚨 AI Error:", error.message);
        console.error("Full error:", error);
        
        // Return fallback response instead of error
        const fallback = getFallbackResponse(req.body.message || '');
        res.json({ 
            success: true, 
            reply: fallback.reply + "\n\n*(Note: AI is temporarily unavailable, showing cached response)*",
            suggestions: fallback.suggestions,
            timestamp: new Date().toISOString(),
            fallback: true,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get quick suggestions for conversation starters
 */
exports.getSuggestions = async (req, res) => {
    try {
        const { topic } = req.query;
        
        let suggestions;
        switch (topic?.toLowerCase()) {
            case 'gad':
                suggestions = quickReplies.gad;
                break;
            case 'vawc':
                suggestions = quickReplies.vawc;
                break;
            case 'sex':
                suggestions = quickReplies.sex;
                break;
            default:
                suggestions = quickReplies.general;
        }

        res.json({ success: true, suggestions });
    } catch (error) {
        console.error("Suggestions Error:", error.message);
        res.status(500).json({ success: false, error: 'Failed to get suggestions' });
    }
};

/**
 * Get emergency resources and hotlines
 */
exports.getResources = async (req, res) => {
    try {
        const resources = {
            emergency: [
                { name: "PNP Women's Desk", number: "117", description: "24/7 Police hotline for women and children" },
                { name: "DSWD Hotline", number: "(02) 931-8101", description: "Social welfare assistance" },
                { name: "CHR", number: "(02) 294-8704", description: "Commission on Human Rights" },
                { name: "Bantay Bata", number: "163", description: "Child abuse reporting" }
            ],
            online: [
                { name: "PCW", url: "https://pcw.gov.ph", description: "Philippine Commission on Women" },
                { name: "DSWD", url: "https://www.dswd.gov.ph", description: "Department of Social Welfare" }
            ],
            topics: [
                { id: 'gad', name: 'Gender and Development', icon: '⚧️' },
                { id: 'vawc', name: 'Violence Prevention', icon: '🛡️' },
                { id: 'sex', name: 'Sex Education', icon: '📚' }
            ]
        };

        res.json({ success: true, resources });
    } catch (error) {
        console.error("Resources Error:", error.message);
        res.status(500).json({ success: false, error: 'Failed to get resources' });
    }
};