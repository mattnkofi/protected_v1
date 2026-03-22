// src/router/index.js
import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@stores/auth"
import publicRoutes from "@router/modules/public"
import authenticatedRoutes from '@/router/modules/authenticated'
import { roleGuard } from './guards/roleGuard';

const routes = [
    ...publicRoutes,
    ...authenticatedRoutes,
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@views/NotFound.vue"),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        if (to.hash) {
            return { el: to.hash, behavior: 'smooth' };
        }
        return { top: 0 };
    }
})

// Helper function to check permissions
async function checkRoutePermissions(to, auth) {
    const orgId = to.params.id

    // Routes that don't need permission checks (like home feed)
    if (!to.meta.requiresPermission && !to.meta.requiresAdmin && !to.meta.requiresMember) {
        return true
    }

    // If no org ID but permission is required, something is wrong
    if (!orgId) {
        console.warn('No organization ID found for permission check on route:', to.name)
        return { name: 'home', query: { error: 'no_org_id' } }
    }

    const permissionStore = usePermissionStore()

    try {
        // Load permissions for this organization (will use cache if valid)
        await permissionStore.load(orgId)

        // Check member requirement first
        if (to.meta.requiresMember && !permissionStore.isMember(orgId)) {
            console.warn('User is not a member of organization:', orgId)
            return { name: 'home', query: { error: 'not_member' } }
        }

        // Check admin requirement
        if (to.meta.requiresAdmin && !permissionStore.isAdmin(orgId)) {
            console.warn('User is not an admin of organization:', orgId)
            return { name: 'org.manage', params: { id: orgId }, query: { error: 'admin_required' } }
        }

        // Check specific permissions
        if (to.meta.requiresPermission) {
            const permission = to.meta.requiresPermission

            if (typeof permission === 'string') {
                if (!permissionStore.hasPermission(orgId, permission)) {
                    console.warn('User lacks permission:', permission)
                    return { name: 'org.manage', params: { id: orgId }, query: { error: 'insufficient_permissions' } }
                }
            } else if (Array.isArray(permission)) {
                const requireAll = to.meta.requiresAllPermissions === true
                const hasAccess = requireAll
                    ? permissionStore.hasAllPermissions(orgId, permission)
                    : permissionStore.hasAnyPermission(orgId, permission)

                if (!hasAccess) {
                    console.warn('User lacks required permissions:', permission)
                    return { name: 'org.manage', params: { id: orgId }, query: { error: 'insufficient_permissions' } }
                }
            }
        }

        return true
    } catch (error) {
        console.error('Permission check failed:', error)
        // Clear cache on error
        permissionStore.clearOrg(orgId)
        return { name: 'home', query: { error: 'permission_check_failed' } }
    }
}

router.beforeEach(async (to, from, next) => {

    const auth = useAuthStore()

    // Determine if the route needs authentication
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    // If user not yet loaded, restore session from backend
    if (!auth.user && !auth.isLoading) {
        try {
            await auth.restoreSession()
        } catch (err) {
            console.error('[v0] Failed to restore session:', err)
            auth.user = null
        }
    }

    const isAuthenticated = !!auth.user

    // 1. User needs to be authenticated but isn't → redirect to login
    if (requiresAuth && !isAuthenticated) {
        console.log('[v0] Authentication required, redirecting to login')
        return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // 2. Authenticated user trying to visit auth pages → send to dashboard
    if ((to.name === 'login' || to.name === 'signup') && isAuthenticated) {
        console.log('[v0] Already authenticated, redirecting to user dashboard')
        return next({ name: 'user.dashboard' })
    }


    // const auth = useAuthStore()

    // // Determine if the route needs authentication
    // const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    // // If user not yet loaded, check session from backend once
    // if (!auth.user && !auth.isLoading) {
    //     try {
    //         await auth.restoreSession()
    //     } catch (err) {
    //         console.error('Failed to restore session:', err)
    //         auth.user = null
    //     }
    // }

    // const isAuthenticated = !!auth.user

    // // 1️⃣ Needs login but user not logged in → redirect to login
    // if (requiresAuth && !isAuthenticated) {
    //     console.log('Authentication required, redirecting to login')
    //     return next({ name: "login", query: { redirect: to.fullPath } })
    // }

    // // 2️⃣ Logged-in user trying to visit Login/Signup → send to home
    // if ((to.name === "login" || to.name === "signup") && isAuthenticated) {
    //     console.log('Already authenticated, redirecting to home')
    //     return next({ name: "home" })
    // }

    // // 3️⃣ Check permissions for organization routes ONLY
    // // Home route and other non-org routes should pass through
    // if (isAuthenticated && to.params.id && (to.meta.requiresPermission || to.meta.requiresAdmin || to.meta.requiresMember)) {
    //     console.log('Checking permissions for route:', to.name)
    //     const permissionCheck = await checkRoutePermissions(to, auth)

    //     if (permissionCheck !== true) {
    //         console.log('Permission check failed, redirecting')
    //         return next(permissionCheck)
    //     }
    // }

    // 4️⃣ Otherwise → allow
    next()
})

// Optional: Add error handling for navigation errors
router.onError((error) => {
    console.error('Router error:', error)
})

// Optional: Clear permission cache on logout
router.afterEach((to, from) => {
    // If navigating away from an org, you might want to do cleanup
    // But generally the cache will handle itself with the 5-minute validity
})

export default router