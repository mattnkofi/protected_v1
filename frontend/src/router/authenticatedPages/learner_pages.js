// src/router/authenticatedPages/learner_pages.js

/**
 * Children of /dashboard (UserDashboardLayout)
 * All paths are RELATIVE — no leading slash.
 */
export const learnerPages = [
    {
        path: '',
        name: 'user.dashboard',
        component: () => import('@/views/dashboard/UserDashboard.vue'),
        meta: { title: 'Dashboard' }
    },
    {
        path: 'behavioral-assessment',
        name: 'user.behavioral-assessment',
        component: () => import('@/views/dashboard/BehavioralAssessment.vue'),
        meta: { title: 'Behavioral Assessment' }
    },
    {
        path: 'classrooms',
        name: 'classrooms.index',
        component: () => import('@/views/classrooms/ClassroomDashboard.vue'),
        meta: { title: 'My Classrooms' }
    },
    {
        path: 'classrooms/:id',
        name: 'classrooms.show',
        component: () => import('@/views/classrooms/ClassroomDetail.vue'),
        meta: { title: 'Classroom Details' }
    },
    {
        path: 'modules',
        name: 'user.modules',
        component: () => import('@/views/Modules.vue'),
        meta: { title: 'Learning Modules' }
    },
{
    path: 'modules/:id',
    name: 'user.module.detail',
    component: () => import('@/views/ModuleDetail.vue'),
    meta: { title: 'Learning Module' }
},
    // {
    //     path: 'learning-paths/:id',
    //     name: 'user.learning-path',
    //     component: () => import('@/views/dashboard/LearningPath.vue'),
    //     meta: { title: 'Learning Path' }
    // },
    // {
    //     path: 'leaderboard',
    //     name: 'user.leaderboard',
    //     component: () => import('@/views/dashboard/Leaderboard.vue'),
    //     meta: { title: 'Leaderboards' }
    // },
    {
        path: 'rewards-shop',
        name: 'user.rewards-shop',
        component: () => import('@/views/dashboard/RewardsShop.vue'),
        meta: { title: 'Rewards Shop' }
    },
    {
        path: 'my-inventory',
        name: 'user.my-inventory',
        component: () => import('@/views/dashboard/MyInventory.vue'),
        meta: { title: 'My Inventory' }
    },
];