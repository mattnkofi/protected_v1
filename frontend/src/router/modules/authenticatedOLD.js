// src/router/modules/authenticated.js
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout.vue';
import FacilitatorDashboardLayout from '@/layouts/FacilitatorDashboardLayout.vue';
import UserDashboardLayout from '@/layouts/UserDashboardLayout.vue';

import { learnerPages } from '../authenticatedPages/learner_pages';
import { facilitatorPages } from '../authenticatedPages/facilitator_pages';
import { adminPages } from '../authenticatedPages/admin_pages';

const authenticatedRoutes = [

    // ===== Player Routes =====
    {
        path: '/dashboard',
        component: UserDashboardLayout,
        meta: {
            requiresAuth: true,
            requiresRole: ['player']
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
            requiresRole: ['admin']
        },
        children: adminPages
    },

    // ===== Quiz Player (all authenticated roles) =====
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

    // ===== Shared Profile & Settings (all authenticated roles) =====
    {
        path: '/me',
        component: () => import('@layouts/UserProfileLayout.vue'),
        meta: { requiresAuth: true },
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
            }
        ]
    }
];

export default authenticatedRoutes;