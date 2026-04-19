import { defineStore } from "pinia"
import { ref } from "vue"

export const useToastStore = defineStore("toast", () => {
    const toasts = ref([])
    let idCounter = 0

    // Sound enabled state — reads the same localStorage key as the notification store
    // so both stores stay in sync with the user's preference
    const soundEnabled = ref(localStorage.getItem('notificationSoundEnabled') !== 'false')

    // ── Audio (Web Audio API synthesis — no external files needed) ──────────
    //
    // FIX: The old base64 WAV strings were stub data that produced no output.
    // Replaced with synthesized tones using Web Audio API, matching the
    // approach used in notification.js.
    //
    // Tone profiles:
    //   success → bright two-tone rise  (G5 → C6)
    //   error   → descending two-tone   (C5 → A4), minor feel
    //   warning → single held tone      (A4), neutral
    //   info    → soft single pop       (E5)

    let audioCtx = null;

    const _getCtx = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    };

    const _beep = (notes) => {
        const ctx = _getCtx();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.3, now); // fixed at 0.3 — same as old code
        master.connect(ctx.destination);

        notes.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + start);
            gain.gain.setValueAtTime(0, now + start);
            gain.gain.linearRampToValueAtTime(1, now + start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
            osc.connect(gain);
            gain.connect(master);
            osc.start(now + start);
            osc.stop(now + start + dur + 0.02);
        });
    };

    const TONE_PROFILES = {
        success: [
            { freq: 784.00, start: 0,    dur: 0.10 }, // G5
            { freq: 1046.5, start: 0.09, dur: 0.16 }, // C6
        ],
        error: [
            { freq: 523.25, start: 0,    dur: 0.12 }, // C5
            { freq: 440.00, start: 0.11, dur: 0.16 }, // A4
        ],
        warning: [
            { freq: 440.00, start: 0, dur: 0.20 },    // A4 held
        ],
        info: [
            { freq: 659.25, start: 0, dur: 0.14 },    // E5 soft pop
        ],
    };

    const playSound = (type) => {
        if (!soundEnabled.value) return;
        try {
            _beep(TONE_PROFILES[type] || TONE_PROFILES.info);
        } catch (_) {
            // Silent fail — AudioContext may be unavailable in some envs
        }
    };

    // ── Toast management ────────────────────────────────────────────────────

    const addToast = (message, type = "info", duration = 3000, withSound = true) => {
        const id = ++idCounter

        toasts.value.push({
            id,
            message,
            type, // 'success' | 'error' | 'warning' | 'info'
            duration,
        })

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