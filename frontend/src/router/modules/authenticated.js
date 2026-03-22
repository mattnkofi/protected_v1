// src/router/modules/authenticated.js
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout.vue';
import FacilitatorDashboardLayout from '@/layouts/FacilitatorDashboardLayout.vue';
import UserDashboardLayout from '@/layouts/UserDashboardLayout.vue';

/**
 * Shared Module Detail Definition
 * Ginagamit ang ABSOLUTE PATH (may slash sa simula) para hindi mag-404
 * kahit nanggaling ang user sa malalim na nested route gaya ng classrooms/:id.
 */
const sharedModuleRoute = {
    path: '/modules/:id',
    name: 'ModuleDetail',
    component: () => import('@/views/ModuleDetail.vue'),
    meta: {
        requiresAuth: true,
        // Pinapayagan ang lahat ng roles para hindi harangin ng RoleGuard
        requiresRole: ['player', 'educator', 'moderator', 'admin'],
        title: 'Learning Module'
    }
};

const authenticatedRoutes = [
    // ===== User/Player Routes (EXCLUSIVE TO PLAYERS) =====
    {
        path: '/dashboard',
        component: UserDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: 'player'
        },
        children: [
            {
                path: '',
                name: 'user.dashboard',
                component: () => import('@/views/dashboard/UserDashboard.vue'),
                meta: { title: 'Dashboard' }
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
            // Load Module Detail within Student Layout
            sharedModuleRoute,
            {
                path: 'learning-paths/:id',
                name: 'user.learning-path',
                component: () => import('@/views/dashboard/LearningPath.vue'),
                meta: { title: 'Learning Path' }
            },
            {
                path: 'leaderboard',
                name: 'user.leaderboard',
                component: () => import('@/views/dashboard/Leaderboard.vue'),
                meta: {
                    title: 'Leaderboards',
                    requiresRole: ['player', 'educator', 'moderator', 'admin']
                }
            },
            {
                path: 'settings',
                name: 'user.settings',
                component: () => import('@/views/Settings.vue'),
                meta: { title: 'Settings' }
            },
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
            }
        ]
    },

    // ===== Facilitator Routes (EXCLUSIVE TO EDUCATORS/MODERATORS/ADMIN) =====
    {
        path: '/facilitator',
        component: FacilitatorDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: ['educator', 'moderator', 'admin']
        },
        children: [
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
            // Load Module Detail within Facilitator Layout
            // Ginamit ang unique name para sa facilitator context
            { ...sharedModuleRoute, name: 'facilitator.modules.detail' },
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
        ]
    },

    // ===== Admin Routes (EXCLUSIVE TO ADMIN) =====
    {
        path: '/admin',
        component: AdminDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: 'admin'
        },
        children: [
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
            }
        ]
    },

    // ===== Independent Views (Outside main layouts) =====
    {
        path: '/quiz/play/:id',
        name: 'quiz.player',
        component: () => import('@/views/QuizPlayer.vue'),
        meta: {
            requiresAuth: true,
            requiresRole: ['player', 'educator', 'moderator', 'admin'],
            title: 'Quiz Challenge'
        }
    },
    // {
    //     path: '/profile',
    //     name: 'profile',
    //     component: () => import('@/views/Profile.vue'),
    //     meta: {
    //         requiresAuth: true,
    //         title: 'My Profile'
    //     }
    // },
    // {
    //     path: '/settings',
    //     name: 'settings',
    //     component: () => import('@/views/Settings.vue'),
    //     meta: {
    //         requiresAuth: true,
    //         title: 'Account Settings'
    //     }
    // }

    {
        path: '/me',
        component: () => import('@layouts/UserProfileLayout.vue'),
        meta: { requiresAuth: true},
        children: [
            {
                path: 'profile',
                name: 'profile',
                component: () => import('@views/Profile.vue'),
                meta: { title: 'My Profile' }
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('@views/Settings.vue'),
                meta: { title: 'Settings' }
            },
        ]
    },
];

export default authenticatedRoutes;