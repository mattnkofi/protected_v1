import { defineStore } from "pinia"
import { ref } from "vue"

export const useToastStore = defineStore("toast", () => {
    const toasts = ref([])
    let idCounter = 0

    // Sound enabled state - syncs with notification store preference
    const soundEnabled = ref(localStorage.getItem('notificationSoundEnabled') !== 'false')

    // Short notification sounds (base64 encoded tiny beeps)
    const sounds = {
        success: 'data:audio/wav;base64,UklGRl4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToCAAB4AIoAlgCgAKcArACvALAArgCqAKQAnACTAIgAfABuAGAAUQBCADMAJQAYAAwAAQD3/+3/5f/d/9f/0v/O/8v/yf/J/8n/y//O/9L/1//d/+X/7f/3/wEADAA=',
        error: 'data:audio/wav;base64,UklGRl4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToCAAC4ALQArACgAJIAgwBzAGMAUwBFADgALAAhABgAEQALAAYAAwABAAD/AP/9//3//f/9//7/AAACAAQABwALABAAFgAdACUALgA4AEMA',
        warning: 'data:audio/wav;base64,UklGRl4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToCAABwAHwAhgCOAJQAmQCcAJ0AnACZAJQAjgCGAHwAcABkAFcASgA9ADEAJgAcABQADAAGAAEA/f/6//j/9//3//n//P8AAAYADwAZACUAMwBC',
        info: 'data:audio/wav;base64,UklGRl4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToCAABgAGwAdgB+AIQAiACKAIoAiACEAH4AdgBsAGAAVABIADwAMQAnAB4AFgAQAAoABgADAAEAAP8A//7//v/+////AAACAAUACQAOABQA'
    }

    const playSound = (type) => {
        if (!soundEnabled.value) return

        const soundUrl = sounds[type] || sounds.info
        try {
            const audio = new Audio(soundUrl)
            audio.volume = 0.3
            audio.play().catch(() => {})
        } catch (e) {
            // Silent fail
        }
    }

    const addToast = (message, type = "info", duration = 3000, withSound = true) => {
        const id = ++idCounter

        toasts.value.push({
            id,
            message,
            type, // 'success' | 'error' | 'warning' | 'info'
            duration,
        })

        // Play sound for the toast type
        if (withSound) {
            playSound(type)
        }

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex((t) => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const clearAll = () => {
        toasts.value = []
    }

    const toggleSound = () => {
        soundEnabled.value = !soundEnabled.value
        localStorage.setItem('notificationSoundEnabled', soundEnabled.value)
    }

    return {
        toasts,
        soundEnabled,
        addToast,
        removeToast,
        clearAll,
        toggleSound,
        playSound,
    }
})
