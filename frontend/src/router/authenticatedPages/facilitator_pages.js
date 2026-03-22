// src/router/authenticatedPages/facilitator_pages.js

/**
 * Children of /facilitator (FacilitatorDashboardLayout)
 * All paths are RELATIVE — no leading slash.
 */
export const facilitatorPages = [
    {
        path: '',
        redirect: { name: 'facilitator.dashboard' }
    },
    {
        path: 'dashboard',
        name: 'facilitator.dashboard',
        component: () => import('@/views/facilitator/FacilitatorDashboard.vue'),
        meta: { title: 'Facilitator Portal' }
    },
    {
        path: 'classrooms',
        name: 'facilitator.classrooms',
        component: () => import('@/views/classrooms/ClassroomDashboard.vue'),
        meta: { title: 'Classroom Management' }
    },
    {
        path: 'classrooms/:id',
        name: 'facilitator.classrooms.show',
        component: () => import('@/views/classrooms/ClassroomDetail.vue'),
        meta: { title: 'Classroom Overview' }
    },
    {
        path: 'modules',
        name: 'facilitator.modules',
        component: () => import('@/views/Modules.vue'),
        meta: { title: 'My Modules' }
    },
    {
        path: 'modules/:id',
        name: 'facilitator.module.detail',
        component: () => import('@/views/ModuleDetail.vue'),
        meta: { title: 'Learning Module' }
    },
    {
        path: 'module-stats/:id',
        name: 'facilitator.module-stats',
        component: () => import('@/views/facilitator/ModuleStats.vue'),
        meta: { title: 'Module Analytics' }
    },
    {
        path: 'rewards',
        name: 'facilitator.rewards',
        component: () => import('@/views/facilitator/RewardsManager.vue'),
        meta: { title: 'Rewards Manager' }
    }
];