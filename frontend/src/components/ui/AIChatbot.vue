<template>
    <div class="fixed bottom-6 right-6 z-[999] font-poppins">

        <!-- ═══════════════════════════════════════════════════
             CHAT WINDOW
             Light : platinum layers   Dark : abyss layers
        ════════════════════════════════════════════════════ -->
        <Transition name="slide-up">
            <div
                v-if="isOpen"
                class="fixed flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-[9999]
                       bg-platinum-100 dark:bg-abyss-800
                       border-2 border-platinum-300 dark:border-abyss-600"
                :class="isFullscreen
                    ? 'inset-0 w-full h-full rounded-none'
                    : 'bottom-20 right-6 w-[400px] md:w-[450px] h-[650px] rounded-2xl'"
            >

                <!-- ── HEADER  (L2 — richer than shell) ───── -->
                <div class="px-5 py-4 flex justify-between items-center shrink-0
                            bg-platinum-200 dark:bg-abyss-700
                            border-b-2 border-platinum-300 dark:border-abyss-600">
                    <div class="flex items-center gap-3">
                        <!-- Bot avatar badge -->
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                    bg-calm-lavender-50 dark:bg-calm-lavender-900/40
                                    border-2 border-calm-lavender-200 dark:border-calm-lavender-700/60
                                    text-calm-lavender-600 dark:text-calm-lavender-400">
                            <Bot class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-bold text-sm
                                       text-abyss-800 dark:text-platinum-100
                                       leading-none">Lumina</h3>
                            <div class="flex items-center gap-1.5 mt-1">
                                <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-teal-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-safety-teal-500"></span>
                                </span>
                                <span class="font-mplusrounded text-xs
                                             text-platinum-500 dark:text-platinum-200">Always Online</span>
                            </div>
                        </div>
                    </div>

                    <!-- Header action buttons -->
                    <div class="flex items-center gap-1">
                        <button @click="toggleFullscreen" class="header-btn"
                            :title="isFullscreen ? 'Minimize' : 'Maximize'">
                            <component :is="isFullscreen ? Minimize2 : Maximize2" class="w-4 h-4" />
                        </button>
                        <button @click="clearChat" class="header-btn" title="Clear chat">
                            <Trash2 class="w-4 h-4" />
                        </button>
                        <button @click="toggleChat" class="header-btn header-btn--close" title="Close">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- ── TOPIC PILLS ─────────────────────────── -->
                <div class="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0
                            bg-platinum-100 dark:bg-abyss-800
                            border-b border-platinum-200 dark:border-abyss-600">
                    <button
                        v-for="topic in topics"
                        :key="topic.id"
                        @click="selectTopic(topic)"
                        class="flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl
                               text-xs font-medium transition-all duration-200 border-2"
                        :class="selectedTopic === topic.id
                            ? 'bg-calm-lavender-600 dark:bg-calm-lavender-700/50 text-white dark:text-calm-lavender-300 border-calm-lavender-700 dark:border-calm-lavender-600/60'
                            : 'bg-platinum-200 dark:bg-abyss-700 border-platinum-300 dark:border-abyss-500 text-platinum-600 dark:text-platinum-500 hover:bg-platinum-300 dark:hover:bg-abyss-600 hover:text-abyss-800 dark:hover:text-platinum-300 hover:border-calm-lavender-200 dark:hover:border-abyss-400'"
                    >
                        <component
                            :is="topic.icon"
                            class="w-3.5 h-3.5"
                            :class="selectedTopic === topic.id
                                ? 'text-white dark:text-calm-lavender-400'
                                : 'text-platinum-500 dark:text-platinum-600'"
                        />
                        {{ topic.name }}
                    </button>
                </div>

                <!-- ── MESSAGES AREA ───────────────────────── -->
                <div
                    ref="messagesContainer"
                    class="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar
                           bg-platinum-50 dark:bg-abyss-800"
                >
                    <!-- Welcome state -->
                    <div v-if="messages.length === 1" class="text-center py-10">
                        <div class="w-20 h-20 mx-auto mb-5
                                    bg-calm-lavender-50 dark:bg-calm-lavender-900/30
                                    border-2 border-calm-lavender-200 dark:border-calm-lavender-700/40
                                    rounded-2xl flex items-center justify-center
                                    text-calm-lavender-600 dark:text-calm-lavender-400">
                            <ShieldCheck class="w-10 h-10" />
                        </div>
                        <h4 class="font-bold text-base
                                   text-abyss-800 dark:text-platinum-200 mb-2">Welcome to Lumina</h4>
                        <p class="font-mplusrounded text-sm
                                  text-platinum-600 dark:text-platinum-300
                                  px-6 leading-relaxed max-w-[85%] mx-auto">
                            I'm your intelligent assistant. Ask me anything about GAD, VAWC, Sex Ed, or any other topic!
                        </p>
                    </div>

                    <!-- Message list -->
                    <div v-for="(msg, i) in messages" :key="i" class="animate-fadeIn">

                        <!-- User bubble — calm lavender, same both modes -->
                        <div v-if="msg.role === 'user'" class="flex justify-end mb-3 pl-10">
                            <div class="max-w-[85%] px-5 py-3 rounded-2xl rounded-tr-sm
                                        bg-calm-lavender-600 dark:bg-calm-lavender-700
                                        border border-calm-lavender-700 dark:border-calm-lavender-600
                                        text-white text-sm leading-relaxed">
                                {{ msg.text }}
                            </div>
                        </div>

                        <!-- AI bubble -->
                        <div v-else class="flex gap-3 mb-3 pr-4">
                            <!-- AI avatar -->
                            <div class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1
                                        bg-platinum-200 dark:bg-abyss-700
                                        border-2 border-platinum-300 dark:border-abyss-600
                                        text-calm-lavender-600 dark:text-calm-lavender-400">
                                <Bot class="w-4 h-4" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <!-- Bubble -->
                                <div class="px-5 py-3.5 rounded-2xl rounded-tl-sm
                                            bg-platinum-200 dark:bg-abyss-700
                                            border border-platinum-300 dark:border-abyss-500
                                            text-abyss-800 dark:text-platinum-100
                                            text-sm leading-7"
                                     v-html="formatMessage(msg.text)">
                                </div>
                                <!-- Timestamp + model badge -->
                                <div class="flex items-center gap-2 mt-1.5 ml-1">
                                    <span class="font-mplusrounded text-xs
                                                 text-platinum-500 dark:text-platinum-400">
                                        {{ formatTime(msg.timestamp) }}
                                    </span>
                                    <span v-if="msg.model"
                                          class="font-mplusrounded text-xs px-1.5 py-0.5 rounded-lg uppercase tracking-wide
                                                 bg-platinum-200 dark:bg-abyss-600
                                                 border border-platinum-300 dark:border-abyss-500
                                                 text-platinum-600 dark:text-platinum-300">
                                        {{ msg.model.replace('gemini-', '') }}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Typing indicator -->
                    <div v-if="isTyping" class="flex gap-3 animate-fadeIn">
                        <div class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1
                                    bg-platinum-200 dark:bg-abyss-700
                                    border-2 border-platinum-300 dark:border-abyss-600
                                    text-calm-lavender-600 dark:text-calm-lavender-400">
                            <Bot class="w-4 h-4" />
                        </div>
                        <div class="px-5 py-3.5 rounded-2xl rounded-tl-sm w-fit
                                    bg-platinum-200 dark:bg-abyss-700
                                    border border-platinum-300 dark:border-abyss-500">
                            <div class="flex gap-1.5 items-center h-4">
                                <div class="w-1.5 h-1.5 bg-calm-lavender-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div class="w-1.5 h-1.5 bg-neon-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div class="w-1.5 h-1.5 bg-calm-lavender-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ── SUGGESTIONS ─────────────────────────── -->
                <div
                    v-if="suggestions.length > 0 && !isTyping"
                    class="px-4 py-3 shrink-0
                           bg-platinum-100 dark:bg-abyss-800
                           border-t border-platinum-200 dark:border-abyss-600"
                >
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="(suggestion, i) in suggestions"
                            :key="i"
                            @click="sendSuggestion(suggestion)"
                            class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-left transition-all duration-200
                                   bg-platinum-200 dark:bg-abyss-700
                                   border border-platinum-300 dark:border-abyss-500
                                   text-platinum-600 dark:text-platinum-200
                                   hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/30
                                   hover:border-calm-lavender-200 dark:hover:border-calm-lavender-700/50
                                   hover:text-calm-lavender-700 dark:hover:text-calm-lavender-200"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>

                <!-- ── INPUT AREA ──────────────────────────── -->
                <div class="p-4 shrink-0
                            bg-platinum-200 dark:bg-abyss-700
                            border-t-2 border-platinum-300 dark:border-abyss-600">
                    <div class="flex gap-3 items-center">
                        <!-- Text input -->
                        <div class="flex-1 relative">
                            <input
                                v-model="userInput"
                                @keyup.enter="sendMessage"
                                @input="handleInput"
                                class="w-full rounded-xl px-5 py-3 pr-16 text-sm outline-none transition-all disabled:opacity-50
                                       bg-platinum-50 dark:bg-abyss-800
                                       border-2 border-platinum-300 dark:border-abyss-500
                                       text-abyss-800 dark:text-platinum-200
                                       placeholder:text-platinum-500 dark:placeholder:text-platinum-600
                                       focus:border-calm-lavender-400 dark:focus:border-calm-lavender-600
                                       focus:ring-2 focus:ring-calm-lavender-400/20 dark:focus:ring-calm-lavender-600/20"
                                placeholder="Type your question…"
                                :disabled="isTyping"
                                maxlength="500"
                            />
                            <span
                                v-if="userInput.length > 0"
                                class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none
                                       font-mplusrounded text-xs
                                       text-platinum-500 dark:text-platinum-400"
                            >
                                {{ userInput.length }}/500
                            </span>
                        </div>

                        <!-- Send button — flat-3D, same both modes -->
                        <button
                            @click="sendMessage"
                            :disabled="!userInput.trim() || isTyping"
                            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all
                                   bg-calm-lavender-600 dark:bg-calm-lavender-700
                                   border-2 border-calm-lavender-700 dark:border-calm-lavender-600
                                   border-b-4 border-b-calm-lavender-800 dark:border-b-calm-lavender-900
                                   text-white
                                   hover:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600
                                   active:border-b-2 active:translate-y-px
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Footer note -->
                    <div class="flex justify-center items-center gap-1.5 mt-3">
                        <Lock class="w-3 h-3 text-platinum-500 dark:text-platinum-400" />
                        <p class="font-mplusrounded text-xs text-platinum-500 dark:text-platinum-400">
                            Secure &amp; Encrypted · Powered by Gemini AI
                        </p>
                    </div>
                </div>

            </div>
        </Transition>

        <!-- ═══════════════════════════════════════════════════
             FLOATING TRIGGER BUTTON
        ════════════════════════════════════════════════════ -->
        <button
            @click="toggleChat"
            class="group relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center
                   transition-all duration-300 overflow-hidden text-white
                   bg-calm-lavender-600 dark:bg-calm-lavender-700
                   border-2 border-calm-lavender-700 dark:border-calm-lavender-600
                   border-b-4 border-b-calm-lavender-800 dark:border-b-calm-lavender-900
                   hover:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600
                   active:border-b-2 active:translate-y-px"
        >
            <div class="relative z-10 transition-transform duration-300"
                 :class="isOpen ? 'rotate-90 scale-90' : 'group-hover:scale-110'">
                <X v-if="isOpen" class="w-6 h-6 md:w-7 md:h-7" />
                <MessageCircleHeart v-else class="w-6 h-6 md:w-7 md:h-7" />
            </div>

            <!-- New message badge -->
            <span v-if="!isOpen && hasNewMessage" class="absolute top-2 right-2 w-3 h-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500
                             border-2 border-calm-lavender-600 dark:border-calm-lavender-700"></span>
            </span>

            <!-- Tooltip -->
            <span
                v-if="!isOpen"
                class="absolute right-full mr-4 px-3 py-1.5 rounded-xl
                       text-xs whitespace-nowrap pointer-events-none
                       flex items-center gap-2
                       bg-platinum-100 dark:bg-abyss-800
                       border-2 border-platinum-300 dark:border-abyss-600
                       text-abyss-800 dark:text-platinum-300
                       opacity-0 translate-x-2
                       group-hover:opacity-100 group-hover:translate-x-0
                       transition-all duration-300"
            >
                <span class="w-1.5 h-1.5 bg-safety-teal-500 rounded-full"></span>
                Chat with AI
            </span>
        </button>

    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import {
    Bot,
    Maximize2,
    Minimize2,
    Trash2,
    X,
    Send,
    Lock,
    MessageCircleHeart,
    ShieldCheck,
    BookOpen,
    HeartHandshake,
    Users,
    Heart
} from 'lucide-vue-next';
import api from '@/utils/api';

// State
const isOpen = ref(false);
const isFullscreen = ref(false);
const isTyping = ref(false);
const userInput = ref('');
const messagesContainer = ref(null);
const hasNewMessage = ref(false);
const selectedTopic = ref('gad');

// Topics
const topics = [
    { id: 'gad',  name: 'GAD',    icon: Users         },
    { id: 'vawc', name: 'VAWC',   icon: HeartHandshake },
    { id: 'sex',  name: 'Sex Ed', icon: Heart          }
];

// Messages with localStorage persistence
const STORAGE_KEY = 'lumina_chatbot_messages';
const messages = ref([]);
const suggestions = ref(['Tell me about GAD', 'Explain quantum physics', 'Help me with coding', 'What is VAWC?']);

// Initialize messages from localStorage
onMounted(() => {
    loadMessages();
    if (messages.value.length === 0) {
        messages.value = [{
            role: 'ai',
            text: 'Mabuhay! 👋 I\'m **Lumina**, your friendly assistant!\n\nI can help you with **any topic** - from GAD, VAWC, and Sex Education to science, math, coding, history, and more!\n\nWhat would you like to know?',
            timestamp: new Date().toISOString()
        }];
        saveMessages();
    }
});

// Watch for new messages to scroll
watch(messages, () => {
    nextTick(() => scrollToBottom());
}, { deep: true });

// Load messages from localStorage
function loadMessages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) messages.value = JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load chat history:', e);
    }
}

// Save messages to localStorage
function saveMessages() {
    try {
        const toSave = messages.value.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.error('Failed to save chat history:', e);
    }
}

// Toggle chat window
function toggleChat() {
    isOpen.value = !isOpen.value;
    hasNewMessage.value = false;
    if (isOpen.value) nextTick(() => scrollToBottom());
}

// Toggle fullscreen
function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
    nextTick(() => scrollToBottom());
}

// Scroll to bottom of messages
function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}

// Format message with basic markdown
function formatMessage(text) {
    if (!text) return '';
    return text
        .replace(/^### (.*$)/gim, '<h3 class="font-bold text-abyss-700 dark:text-platinum-100 mt-2 mb-1">$1</h3>')
        .replace(/^## (.*$)/gim,  '<h2 class="font-bold text-abyss-700 dark:text-platinum-100 mt-2 mb-1">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-abyss-900 dark:text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\* /gm,  '<div class="flex gap-2 mb-1"><span class="text-calm-lavender-400">•</span><span>')
        .replace(/^• /gm,   '<div class="flex gap-2 mb-1"><span class="text-calm-lavender-400">•</span><span>')
        .replace(/\n\n/g, '</span></div><br>')
        .replace(/\n/g, '<br>');
}

// Format timestamp
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Handle input changes
function handleInput() {
    // Could add typing indicator or other features here
}

// Select topic for quick suggestions
async function selectTopic(topic) {
    selectedTopic.value = topic.id;
    try {
        const res = await api.get(`/api/v1/chatbot/suggestions?topic=${topic.id}`);
        if (res.data.success) suggestions.value = res.data.suggestions;
    } catch (e) {
        console.error('Failed to fetch suggestions:', e);
    }
}

// Send a suggestion as a message
function sendSuggestion(text) {
    userInput.value = text;
    sendMessage();
}

// Clear chat history
function clearChat() {
    messages.value = [{
        role: 'ai',
        text: 'Chat cleared! 🔄 Ask me anything - I\'m ready to help!',
        timestamp: new Date().toISOString()
    }];
    suggestions.value = ['Tell me about GAD', 'Explain quantum physics', 'Help me with coding', 'What is VAWC?'];
    selectedTopic.value = 'gad';
    saveMessages();
}

// Send message to AI
async function sendMessage() {
    if (!userInput.value.trim() || isTyping.value) return;

    const text = userInput.value.trim();
    const userMessage = {
        role: 'user',
        text,
        timestamp: new Date().toISOString()
    };

    messages.value.push(userMessage);
    userInput.value = '';
    isTyping.value = true;
    saveMessages();

    try {
        const conversationHistory = messages.value
            .slice(-10)
            .map(msg => ({ role: msg.role, text: msg.text }));

        const res = await api.post('/api/v1/chatbot/ask', {
            message: text,
            conversationHistory
        });

        const aiMessage = {
            role: 'ai',
            text: res.data.reply,
            timestamp: res.data.timestamp || new Date().toISOString(),
            model: res.data.model
        };

        messages.value.push(aiMessage);

        if (res.data.suggestions && res.data.suggestions.length > 0) {
            suggestions.value = res.data.suggestions;
        }

        saveMessages();

        if (!isOpen.value) hasNewMessage.value = true;
    } catch (err) {
        console.error('Chat error:', err);
        messages.value.push({
            role: 'ai',
            text: '⚠️ Sorry, I\'m having trouble connecting right now. Please try again in a moment.\n\n**Need immediate help?**\n• PNP Women\'s Desk: 117\n• DSWD Hotline: (02) 931-8101',
            timestamp: new Date().toISOString()
        });
        saveMessages();
    } finally {
        isTyping.value = false;
    }
}
</script>

<style scoped>
@reference "@/style.css";

/* ── Chat window slide-up animation ──────────────────────── */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

/* ── Header icon buttons ─────────────────────────────────── */
.header-btn {
    @apply p-2 rounded-lg transition-all duration-150;
    @apply text-platinum-500 dark:text-platinum-500;
    @apply hover:text-abyss-800 dark:hover:text-platinum-200;
    @apply hover:bg-platinum-300 dark:hover:bg-abyss-600;
}

.header-btn--close {
    @apply hover:bg-red-100 dark:hover:bg-red-900/30;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ── Scrollbars ──────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar       { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-platinum-300 dark:bg-abyss-500 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-calm-lavender-300 dark:bg-calm-lavender-700;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* ── Message fade-in ─────────────────────────────────────── */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
}
</style>