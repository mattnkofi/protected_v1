// src/router/authenticatedPages/admin_pages.js

/**
 * Children of /admin (AdminDashboardLayout)
 * All paths are RELATIVE — no leading slash.
 */
export const adminPages = [
    {
        path: '',
        redirect: { name: 'admin.dashboard' }
    },
    {
        path: 'dashboard',
        name: 'admin.dashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { title: 'Admin Control Panel' }
    },
    {
        path: 'facilitators',
        name: 'admin.facilitators',
        component: () => import('@/views/admin/FacilitatorManagement.vue'),
        meta: { title: 'Facilitator Management' }
    },
    {
        path: 'students',
        name: 'admin.students',
        component: () => import('@/views/admin/AdminStudents.vue'),
        meta: { title: 'Student Directory' }
    },
    {
        path: 'announcements',
        name: 'admin.announcements',
        component: () => import('@/views/admin/AdminAnnouncements.vue'),
        meta: { title: 'Public Announcements' }
    },
    {
        path: 'modules',
        name: 'admin.modules',
        component: () => import('@/views/Modules.vue'),
        meta: { title: 'My Modules' }
    },
    {
        path: 'modules/:id',
        name: 'admin.module.detail',
        component: () => import('@/views/ModuleDetail.vue'),
        meta: { title: 'Learning Module' }
    },
    //     {
    //     path: 'reports',
    //     name: 'admin.reports',
    //     component: () => import('@/views/admin/AdminReports.vue'),
    //     meta: { title: 'Reports' }
    // },
    {
        path: 'analytics',
        name: 'admin.analytics',
        component: () => import('@/views/facilitator/MLAnalytics.vue'),
        meta: { title: 'System-Wide Analytics' }
    },
];