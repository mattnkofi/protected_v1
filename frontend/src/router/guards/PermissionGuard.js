// src/router/guards/permissionGuard.js
import { usePermissionStore } from "@/stores/permission"

export const permissionGuard = async (to, from, next) => {
    // Skip if no permission-related meta
    if (
        !to.meta.requiresPermission &&
        !to.meta.requiresAdmin &&
        !to.meta.requiresMember
    ) {
        return next()
    }

    const orgId = to.params.id

    if (!orgId) {
        console.warn("Permission check failed: missing org ID")
        return next({
            name: "home",
            query: { error: "no_org_id" },
        })
    }

    const permissionStore = usePermissionStore()

    try {
        await permissionStore.load(orgId)

        // Member check
        if (to.meta.requiresMember && !permissionStore.isMember(orgId)) {
            return next({
                name: "home",
                query: { error: "not_member" },
            })
        }

        // Admin check
        if (to.meta.requiresAdmin && !permissionStore.isAdmin(orgId)) {
            return next({
                name: "org.manage",
                params: { id: orgId },
                query: { error: "admin_required" },
            })
        }

        // Specific permission check
        if (to.meta.requiresPermission) {
            const permission = to.meta.requiresPermission

            const hasAccess = Array.isArray(permission)
                ? permissionStore.hasAnyPermission(orgId, permission)
                : permissionStore.hasPermission(orgId, permission)

            if (!hasAccess) {
                return next({
                    name: "org.manage",
                    params: { id: orgId },
                    query: { error: "insufficient_permissions" },
                })
            }
        }

        next()
    } catch (error) {
        console.error("Permission guard error:", error)
        permissionStore.clearOrg(orgId)

        next({
            name: "home",
            query: { error: "permission_check_failed" },
        })
    }
}
