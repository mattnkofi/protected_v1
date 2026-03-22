import { defineStore } from "pinia"
import { ref } from "vue"

export const useSidebarStore = defineStore("sidebar", () => {
    // true = full sidebar, false = icon sidebar (medium+) or hidden (small)
    const isExpanded = ref(false)

    // Mobile sidebar visible (hidden by default)
    const isMobileOpen = ref(false)

    const toggleExpanded = () => {
        isExpanded.value = !isExpanded.value
    }

    const toggleMobile = () => {
        isMobileOpen.value = !isMobileOpen.value
    }

    const closeMobile = () => {
        isMobileOpen.value = false
    }

    return {
        isExpanded,
        isMobileOpen,
        toggleExpanded,
        toggleMobile,
        closeMobile,
    }
})
