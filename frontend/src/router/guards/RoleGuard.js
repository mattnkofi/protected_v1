// src/router/guards/roleGuard.js

import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/utils/useToast'

/**
 * Navigation guard for role-based access control with Toast notifications
 */
export const roleGuard = async (to, from, next) => {
    const authStore = useAuthStore()
    const toast = useToast()

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        // Attempt session restore if not authenticated
        // if (!authStore.isAuthenticated) {
        //     await authStore.restoreSession()
        // }

        if (!authStore.isAuthenticated) {
            toast.warning('Authentication Required: Please log in to access this page')
            return next({ name: 'login', query: { redirect: to.fullPath } })
        }

        // Still not authenticated
        if (!authStore.isAuthenticated) {
            toast.warning('Authentication Required: Please log in to access this page')
            return next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
        }

        // Role-based access check
        if (to.meta.requiresRole) {
            const userRole = authStore.user?.role
            const requiredRoles = Array.isArray(to.meta.requiresRole)
                ? to.meta.requiresRole
                : [to.meta.requiresRole]

            if (!requiredRoles.includes(userRole)) {
                // Pinagandang Access Denied message gamit ang Toast
                toast.error('Access Denied: You do not have permission to view this section')

                const redirectMap = {
                    admin: { name: 'admin.dashboard' },
                    educator: { name: 'facilitator.dashboard' },
                    moderator: { name: 'facilitator.dashboard' },
                    player: { name: 'user.dashboard' }
                }

                return next(redirectMap[userRole] || { name: 'home' })
            }
        }
    }

    // Guest-only routes (e.g., login, register)
    if (to.meta.guest && authStore.isAuthenticated) {
        const userRole = authStore.user?.role
        const redirectMap = {
            admin: { name: 'admin.dashboard' },
            educator: { name: 'facilitator.dashboard' },
            moderator: { name: 'facilitator.dashboard' },
            player: { name: 'user.dashboard' }
        }
        return next(redirectMap[userRole] || { name: 'home' })
    }

    // Update page title
    if (to.meta.title) {
        document.title = `${to.meta.title} | ProtectEd`
    }

    next()
}

/**
 * Helper function to redirect user to their appropriate dashboard
 */
export const redirectToDashboard = (userRole) => {
    const dashboardMap = {
        admin: '/admin/dashboard',
        educator: '/facilitator/dashboard',
        moderator: '/facilitator/dashboard',
        player: '/dashboard'
    }
    return dashboardMap[userRole] || '/'
}