// frontend\src\utils\useToast.js
import { useToastStore } from "@/stores/toast"

export const useToast = () => {
    const toastStore = useToastStore()

    return {
        success: (message, duration = 3000) => toastStore.addToast(message, "success", duration),
        error: (message, duration = 3000) => toastStore.addToast(message, "error", duration),
        warning: (message, duration = 3000) => toastStore.addToast(message, "warning", duration),
        info: (message, duration = 3000) => toastStore.addToast(message, "info", duration),
        custom: (message, type, duration = 3000) => toastStore.addToast(message, type, duration),
        remove: (id) => toastStore.removeToast(id),
        clearAll: () => toastStore.clearAll(),
    }
}
