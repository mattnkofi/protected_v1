<template>
    <div class="page-wrapper animate-in font-poppins">

        <!-- ═══════════════════════════════════════════════════
             HEADER
        ════════════════════════════════════════════════════ -->
        <header class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Admin Console</p>
                <h1 class="page-title tracking-wide">
                    Admin <span class="brand-gradient-text">Dashboard</span>
                </h1>
                <p class="page-subtitle">A quick look at how your community is doing.</p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
                <!-- Download Report — GenerateReport modal component -->
                <GenerateReport endpoint="/api/v1/admin/reports/download" filename="ProtectEd_Report_{date}"
                    title="Download Analytics Report"
                    description="Generates a full PDF — users, modules, classrooms & more"
                    :includes="['Executive Summary', 'Key Metrics', 'Users by Role', 'Recent Users', 'Module Status', 'Classroom Status', 'Quiz Attempts', 'Badge Overview']" />

                <!-- Refresh — flat-3D secondary -->
                <button @click="refreshAnalytics" :disabled="isLoading"
                    class="btn-secondary btn-3d--secondary disabled:opacity-50">
                    <RefreshCwIcon :class="['h-4 w-4', isLoading && 'animate-spin']" />
                    <span>Refresh</span>
                </button>
            </div>
        </header>

        <!-- ═══════════════════════════════════════════════════
             LOADING STATE
        ════════════════════════════════════════════════════ -->
        <div v-if="isLoading && !stats.totalUsers" class="flex items-center justify-center py-24">
            <div class="flex flex-col items-center gap-4">
                <div class="spinner"></div>
                <p class="loading-text">Loading analytics…</p>
            </div>
        </div>

        <template v-else>

            <!-- ═══════════════════════════════════════════════
                 PRIMARY STAT TILES
                 L1 layer: platinum-100 / abyss-700
            ════════════════════════════════════════════════ -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div v-for="stat in statsCards" :key="stat.label" class="stat-tile group">
                    <div class="flex items-start justify-between mb-5">
                        <div class="ds-icon-badge ds-icon-badge--lavender
                                    group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-800/40
                                    transition-colors">
                            <component :is="stat.icon" class="h-5 w-5" />
                        </div>
                        <span class="badge badge-lavender">{{ stat.sub }}</span>
                    </div>
                    <p class="stat-tile__label">{{ stat.label }}</p>
                    <p class="stat-tile__value">{{ stat.val }}</p>
                </div>
            </div>

            <!-- ═══════════════════════════════════════════════
                 SECONDARY STAT TILES
                 L2 inset: platinum-200 / abyss-600
            ════════════════════════════════════════════════ -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="stat in secondaryStats" :key="stat.label" class="secondary-tile">
                    <div class="ds-icon-badge ds-icon-badge--lavender mx-auto mb-3">
                        <component :is="stat.icon" class="h-4 w-4" />
                    </div>
                    <p class="stat-tile__value !text-2xl">{{ stat.val }}</p>
                    <p class="stat-tile__label mt-1">{{ stat.label }}</p>
                </div>
            </div>

            <!-- ═══════════════════════════════════════════════
                 CHARTS SECTION
                 Each chart panel = L1 layer
            ════════════════════════════════════════════════ -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <!-- User Registrations -->
                <div class="chart-panel">
                    <div class="chart-panel__header">
                        <div class="ds-icon-badge ds-icon-badge--lavender">
                            <UsersIcon class="w-4 h-4" />
                        </div>
                        <h3 class="chart-panel__title">User Registrations</h3>
                    </div>
                    <div class="h-64">
                        <Line v-if="chartData.monthlyUsers.length" :data="userChartData" :options="lineChartOptions" />
                        <div v-else class="chart-empty">Loading chart data…</div>
                    </div>
                </div>

                <!-- Quiz Activity -->
                <div class="chart-panel">
                    <div class="chart-panel__header">
                        <div class="ds-icon-badge ds-icon-badge--pink">
                            <ActivityIcon class="w-4 h-4" />
                        </div>
                        <h3 class="chart-panel__title">Quiz Activity</h3>
                    </div>
                    <div class="h-64">
                        <Bar v-if="chartData.monthlyQuizAttempts.length" :data="quizChartData"
                            :options="barChartOptions" />
                        <div v-else class="chart-empty">Loading chart data…</div>
                    </div>
                </div>

                <!-- User Distribution -->
                <div class="chart-panel">
                    <div class="chart-panel__header">
                        <div class="ds-icon-badge ds-icon-badge--lavender">
                            <UserCogIcon class="w-4 h-4" />
                        </div>
                        <h3 class="chart-panel__title">User Distribution</h3>
                    </div>
                    <div class="h-64 flex items-center justify-center">
                        <div class="w-56 h-56">
                            <Doughnut v-if="chartData.roleDistribution.length" :data="roleChartData"
                                :options="doughnutChartOptions" />
                            <div v-else class="chart-empty">Loading chart data…</div>
                        </div>
                    </div>
                </div>

                <!-- Module Creation -->
                <div class="chart-panel">
                    <div class="chart-panel__header">
                        <div class="ds-icon-badge ds-icon-badge--lavender">
                            <BookOpenIcon class="w-4 h-4" />
                        </div>
                        <h3 class="chart-panel__title">Module Creation</h3>
                    </div>
                    <div class="h-64">
                        <Line v-if="chartData.monthlyModules.length" :data="moduleChartData"
                            :options="lineChartOptions" />
                        <div v-else class="chart-empty">Loading chart data…</div>
                    </div>
                </div>

            </div>

            <!-- ═══════════════════════════════════════════════
                 RECENT ACTIVITY  +  QUICK TASKS
            ════════════════════════════════════════════════ -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <!-- Recent Activity — L1 panel -->
                <div class="lg:col-span-7 ds-panel">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="ds-icon-badge ds-icon-badge--lavender">
                            <ActivityIcon class="w-4 h-4" />
                        </div>
                        <h3 class="font-bold text-base text-abyss-800 dark:text-platinum-100">Recent Activity</h3>
                    </div>

                    <div class="space-y-2">
                        <div v-for="activity in recentActivity" :key="activity.id" class="activity-row group">
                            <div class="ds-icon-badge ds-icon-badge--lavender shrink-0
                                        group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-800/40
                                        transition-colors">
                                <component :is="activity.icon" class="h-4 w-4" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-abyss-800 dark:text-platinum-200 truncate">
                                    {{ activity.title }}
                                </p>
                                <p class="field-subtext mt-0.5">{{ activity.time }}</p>
                            </div>
                        </div>

                        <div v-if="recentActivity.length === 0" class="empty-state !py-12">
                            <div class="empty-state-icon">
                                <ActivityIcon class="w-7 h-7 text-platinum-400" />
                            </div>
                            <p class="empty-state-title">No recent activity</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Tasks — L1 panel -->
                <div class="lg:col-span-5 ds-panel">
                    <h3 class="font-bold text-base text-abyss-800 dark:text-platinum-100 mb-5">Quick Tasks</h3>
                    <div class="grid grid-cols-1 gap-3">
                        <router-link v-for="action in quickActions" :key="action.label" :to="{ name: action.name }"
                            class="quick-action-row group">
                            <div :class="['ds-icon-badge border-2 shrink-0 transition-colors', action.iconClass]">
                                <component :is="action.icon" class="h-5 w-5" />
                            </div>
                            <span class="text-sm font-medium text-abyss-800 dark:text-platinum-200
                                         group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400
                                         transition-colors">
                                {{ action.label }}
                            </span>
                            <ArrowRightIcon class="w-4 h-4 text-platinum-400 ml-auto shrink-0
                                                    group-hover:text-calm-lavender-500 group-hover:translate-x-0.5
                                                    transition-all" />
                        </router-link>
                    </div>
                </div>

            </div>

        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line, Bar, Doughnut } from 'vue-chartjs';
import GenerateReport from '@/components/ui/GenerateReport.vue';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    UsersIcon,
    UserCogIcon,
    BookOpenIcon,
    ActivityIcon,
    RefreshCwIcon,
    UserPlusIcon,
    FileTextIcon,
    BarChartIcon,
    SettingsIcon,
    GraduationCapIcon,
    TrophyIcon,
    MegaphoneIcon,
    ClipboardListIcon,
    DownloadIcon,
    ArrowRight as ArrowRightIcon
} from 'lucide-vue-next';
import api from '@/utils/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const isLoading = ref(false);
const stats = ref({
    totalUsers: 0,
    newUsersThisMonth: 0,
    userGrowth: 0,
    totalFacilitators: 0,
    educators: 0,
    moderators: 0,
    totalModules: 0,
    publishedModules: 0,
    modulesThisMonth: 0,
    totalClassrooms: 0,
    activeClassrooms: 0,
    totalQuizzes: 0,
    totalQuizAttempts: 0,
    totalBadges: 0
});

const chartData = ref({
    monthlyUsers: [],
    monthlyModules: [],
    monthlyQuizAttempts: [],
    roleDistribution: [],
    moduleStatus: [],
    classroomStatus: []
});

const recentUsers = ref([]);
const recentModules = ref([]);

const statsCards = computed(() => [
    {
        label: 'Total Users',
        val: stats.value.totalUsers,
        sub: `+${stats.value.newUsersThisMonth} New`,
        icon: UsersIcon
    },
    {
        label: 'Facilitators',
        val: stats.value.totalFacilitators,
        sub: `${stats.value.educators} Edu / ${stats.value.moderators} Mod`,
        icon: UserCogIcon
    },
    {
        label: 'Modules',
        val: stats.value.totalModules,
        sub: `${stats.value.publishedModules} Published`,
        icon: BookOpenIcon
    },
    {
        label: 'Classrooms',
        val: stats.value.totalClassrooms,
        sub: `${stats.value.activeClassrooms} Active`,
        icon: GraduationCapIcon
    }
]);

const secondaryStats = computed(() => [
    { label: 'Quizzes', val: stats.value.totalQuizzes, icon: ClipboardListIcon },
    { label: 'Quiz Attempts', val: stats.value.totalQuizAttempts, icon: ActivityIcon },
    { label: 'Badges', val: stats.value.totalBadges, icon: TrophyIcon },
    { label: 'Growth %', val: `${stats.value.userGrowth}%`, icon: BarChartIcon }
]);

// Chart Options
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            titleColor: '#fff',
            bodyColor: '#a78bfa',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10, weight: 600 } }
        },
        y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 10 } },
            beginAtZero: true
        }
    }
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            titleColor: '#fff',
            bodyColor: '#f0abfc',
            borderColor: 'rgba(192, 38, 211, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10, weight: 600 } }
        },
        y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 10 } },
            beginAtZero: true
        }
    }
};

const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#94a3b8',
                padding: 16,
                font: { size: 10, weight: 600 },
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            titleColor: '#fff',
            bodyColor: '#c4b5fd',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12
        }
    },
    cutout: '65%'
};

// Chart Data Computed Properties
const userChartData = computed(() => ({
    labels: chartData.value.monthlyUsers.map(d => d.month),
    datasets: [{
        label: 'New Users',
        data: chartData.value.monthlyUsers.map(d => d.count),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#9333ea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
    }]
}));

const moduleChartData = computed(() => ({
    labels: chartData.value.monthlyModules.map(d => d.month),
    datasets: [{
        label: 'Modules Created',
        data: chartData.value.monthlyModules.map(d => d.count),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
    }]
}));

const quizChartData = computed(() => ({
    labels: chartData.value.monthlyQuizAttempts.map(d => d.month),
    datasets: [{
        label: 'Quiz Attempts',
        data: chartData.value.monthlyQuizAttempts.map(d => d.count),
        backgroundColor: [
            'rgba(192, 38, 211, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(124, 58, 237, 0.8)',
            'rgba(109, 40, 217, 0.8)',
            'rgba(91, 33, 182, 0.8)'
        ],
        borderRadius: 8,
        borderSkipped: false
    }]
}));

const roleChartData = computed(() => ({
    labels: chartData.value.roleDistribution.map(d => d.role),
    datasets: [{
        data: chartData.value.roleDistribution.map(d => d.count),
        backgroundColor: [
            'rgba(147, 51, 234, 0.9)',
            'rgba(192, 38, 211, 0.9)',
            'rgba(168, 85, 247, 0.9)',
            'rgba(124, 58, 237, 0.9)'
        ],
        borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(192, 38, 211, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(124, 58, 237, 1)'
        ],
        borderWidth: 2
    }]
}));

const recentActivity = computed(() => {
    const activities = [];

    recentUsers.value.forEach(user => {
        activities.push({
            id: `user-${user.id}`,
            icon: UserPlusIcon,
            title: `${user.name} joined as ${user.role}`,
            time: formatTimeAgo(user.created_at)
        });
    });

    recentModules.value.forEach(module => {
        activities.push({
            id: `module-${module.id}`,
            icon: FileTextIcon,
            title: `Module "${module.title}" ${module.is_published ? 'published' : 'created'}`,
            time: formatTimeAgo(module.created_at)
        });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);
});

const quickActions = [
    {
        name: 'admin.facilitators',
        icon: UserPlusIcon,
        label: 'Manage Users',
        iconClass: 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-200 dark:border-calm-lavender-800/40 text-calm-lavender-600 dark:text-calm-lavender-400'
    },
    {
        name: 'admin.announcements',
        icon: MegaphoneIcon,
        label: 'Announcements',
        iconClass: 'bg-neon-pink-50 dark:bg-neon-pink-900/20 border-neon-pink-200 dark:border-neon-pink-800/40 text-neon-pink-600 dark:text-neon-pink-400'
    },
    {
        name: 'admin.dashboard',
        icon: FileTextIcon,
        label: 'Manage Lessons',
        iconClass: 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-200 dark:border-calm-lavender-800/40 text-calm-lavender-600 dark:text-calm-lavender-400'
    },
    {
        name: 'settings',
        icon: SettingsIcon,
        label: 'System Settings',
        iconClass: 'bg-platinum-200 dark:bg-abyss-600 border-platinum-300 dark:border-abyss-500 text-platinum-600 dark:text-platinum-400'
    }
];

const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const fetchAnalytics = async () => {
    isLoading.value = true;
    try {
        const [analyticsRes, chartRes] = await Promise.all([
            api.get('/api/v1/admin/analytics'),
            api.get('/api/v1/admin/analytics/charts')
        ]);

        if (analyticsRes.data?.analytics) {
            const data = analyticsRes.data.analytics;
            stats.value = {
                totalUsers: data.users.total,
                newUsersThisMonth: data.users.newThisMonth,
                userGrowth: data.users.growth,
                totalFacilitators: data.facilitators.total,
                educators: data.facilitators.educators,
                moderators: data.facilitators.moderators,
                totalModules: data.modules.total,
                publishedModules: data.modules.published,
                modulesThisMonth: data.modules.newThisMonth,
                totalClassrooms: data.classrooms.total,
                activeClassrooms: data.classrooms.active,
                totalQuizzes: data.quizzes.total,
                totalQuizAttempts: data.quizzes.totalAttempts,
                totalBadges: data.badges.total
            };
            recentUsers.value = data.recentActivity.users || [];
            recentModules.value = data.recentActivity.modules || [];
        }

        if (chartRes.data?.chartData) {
            chartData.value = chartRes.data.chartData;
        }
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
    } finally {
        isLoading.value = false;
    }
};

const refreshAnalytics = () => {
    fetchAnalytics();
};

onMounted(() => {
    fetchAnalytics();
});
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   PAGE WRAPPER
═══════════════════════════════════════════════════════════ */
.page-wrapper {
    @apply space-y-7 text-abyss-800 dark:text-platinum-100;
}

/* ═══════════════════════════════════════════════════════════
   DS-PANEL  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.ds-panel {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-6;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 flex items-center justify-center shrink-0;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

.ds-icon-badge--pink {
    @apply bg-neon-pink-50 dark:bg-neon-pink-900/20;
    @apply border-neon-pink-200 dark:border-neon-pink-800/40;
    @apply text-neon-pink-600 dark:text-neon-pink-400;
}

/* ═══════════════════════════════════════════════════════════
   PRIMARY STAT TILE  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.stat-tile {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60;
    @apply transition-all duration-200;
}

.stat-tile__label {
    @apply text-xs font-medium uppercase tracking-wide;
    @apply text-platinum-600 dark:text-platinum-500;
}

.stat-tile__value {
    @apply text-3xl font-bold leading-none mt-1;
    @apply text-abyss-800 dark:text-platinum-100;
}

/* ═══════════════════════════════════════════════════════════
   SECONDARY STAT TILE  —  L2: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.secondary-tile {
    @apply flex flex-col items-center text-center;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
    @apply transition-all duration-200;
}

/* ═══════════════════════════════════════════════════════════
   CHART PANEL  —  L1: platinum-100 / abyss-700
   No backdrop-blur, no shadow — border defines the panel
═══════════════════════════════════════════════════════════ */
.chart-panel {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-6;
}

.chart-panel__header {
    @apply flex items-center gap-3 mb-6;
}

.chart-panel__title {
    @apply font-bold text-base text-abyss-800 dark:text-platinum-100;
}

.chart-empty {
    @apply flex items-center justify-center h-full;
    @apply font-mplusrounded text-sm font-normal text-platinum-600 dark:text-platinum-400;
}

/* ═══════════════════════════════════════════════════════════
   ACTIVITY ROW  —  L2 inset inside Recent Activity panel
═══════════════════════════════════════════════════════════ */
.activity-row {
    @apply flex items-center gap-4 p-3.5 rounded-xl transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
}

/* ═══════════════════════════════════════════════════════════
   QUICK ACTION ROW  —  L2 inset inside Quick Tasks panel
═══════════════════════════════════════════════════════════ */
.quick-action-row {
    @apply flex items-center gap-4 p-4 rounded-xl transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
    @apply hover:-translate-y-0.5;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>