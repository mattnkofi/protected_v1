// src/router/modules/authenticated.js
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout.vue';
import FacilitatorDashboardLayout from '@/layouts/FacilitatorDashboardLayout.vue';
import UserDashboardLayout from '@/layouts/UserDashboardLayout.vue';

import { adminPages } from '@/router/authenticatedPages/admin_pages';
import { facilitatorPages } from '@/router/authenticatedPages/facilitator_pages';
import { learnerPages } from '@/router/authenticatedPages/learner_pages';

const authenticatedRoutes = [
    // ===== User/Player Routes =====
    {
        path: '/dashboard',
        component: UserDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: 'player'
        },
        children: learnerPages
    },

    // ===== Facilitator Routes =====
    {
        path: '/facilitator',
        component: FacilitatorDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: ['educator', 'moderator', 'admin']
        },
        children: facilitatorPages
    },

    // ===== Admin Routes =====
    {
        path: '/admin',
        component: AdminDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: 'admin'
        },
        children: adminPages
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

    {
        path: '/me',
        component: () => import('@layouts/UserProfileLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'profile',
                name: 'profile',
                component: () => import('@/views/Profile.vue'),
                meta: { title: 'My Profile' }
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('@/views/Settings.vue'),
                meta: { title: 'Settings' }
            },
        ]
    },
];

export default authenticatedRoutes;