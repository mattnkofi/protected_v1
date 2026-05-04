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
        name: 'facilitator.modules.detail',
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
        meta: { title: 'Rewards Manager',requiresAuth: true, role: 'facilitator' }
    },
    {
        path: 'ml-analytics',
        name: 'facilitator.ml-analytics',
        component: () => import('@/views/facilitator/MLAnalytics.vue'),
        meta: { title: 'ML Analytics Dashboard' }
    },
    {
        path: 'resource-center',
        name: 'facilitator.resource-center',
        component: () => import('@/views/resources/ResourceCenter.vue'),
        meta: { title: 'Resource Center' }
    },
    {
        path: 'purple-desk',
        name: 'facilitator.purple-desk',
        component: () => import('@/views/safety/PurpleDesk.vue'),
        meta: { title: 'Purple Desk' }
    },
    {
        path: 'gad/manage',
        name: 'facilitator.gad.manage',
        component: () => import('@/views/gad/GADProposalManager.vue'),
        meta: { title: 'WGAD Proposals' }
    },
    {
        path: 'gad/language-analyzer',
        name: 'facilitator.gad.language-analyzer',
        component: () => import('@/views/GADLanguageAnalyzer.vue'),
        meta: { title: 'WGAD Language Analyzer' }
    },
];