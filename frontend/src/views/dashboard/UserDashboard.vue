<template>
    <div class="page-wrapper animate-in text-slate-800 dark:text-platinum-100">
        <div class="space-y-8">

            <!-- ════════════════════════════════════════
                 HEADER
            ════════════════════════════════════════ -->
            <header class="page-header lg:px-2 pb-2">
                <div class="space-y-2">
                    <p class="section-eyebrow font-dosis tracking-widest text-sm text-platinum-500 uppercase font-bold">Student Dashboard</p>
                    <h1 class="font-madimione text-4xl md:text-5xl tracking-tight text-abyss-900 dark:text-platinum-50 leading-none">
                        {{ currentGreeting }},
                        <span class="text-calm-lavender-600 dark:text-calm-lavender-400">{{ userFirstName }}</span>
                        <i class="fa-solid fa-hand text-calm-lavender-500 dark:text-calm-lavender-400"></i>
                    </h1>
                    <!-- Motivational sub-line: empathetic copy → font-mplusrounded -->
                    <p class="font-mplusrounded text-[1.05rem] md:text-lg font-medium leading-relaxed
                               text-platinum-600 dark:text-platinum-400 max-w-2xl pt-1">
                        {{ currentDate }} &mdash; {{ motivationalMessage }}
                    </p>
                </div>

                <!-- Level + Streak chips -->
                <div class="flex gap-4 flex-wrap shrink-0 lg:pt-3">
                    <!-- Level chip -->
                    <div class="stat-chip flex items-center bg-white/60 dark:bg-abyss-800/40 p-1.5 pr-5 rounded-2xl border border-platinum-200 dark:border-abyss-700 shadow-sm gap-3 transition hover:border-calm-lavender-300 dark:hover:border-calm-lavender-600">
                        <div class="p-3 rounded-xl
                                    bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-600/30 dark:to-amber-500/20
                                    text-amber-600 dark:text-amber-400">
                            <ZapIcon class="h-5 w-5" />
                        </div>
                        <div class="flex flex-col leading-none justify-center">
                            <!-- Chip label: technical micro-UI → font-dosis -->
                            <span class="font-dosis text-[0.7rem] md:text-sm font-bold uppercase tracking-widest text-platinum-500 dark:text-platinum-400 mb-0.5">Level</span>
                            <!-- Chip value: gamified number → font-madimione -->
                            <span class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-100">
                                {{ auth.user?.gamification?.level || 1 }}
                            </span>
                        </div>
                    </div>
                    <!-- Streak chip -->
                    <div class="stat-chip flex items-center bg-white/60 dark:bg-abyss-800/40 p-1.5 pr-5 rounded-2xl border border-platinum-200 dark:border-abyss-700 shadow-sm gap-3 transition hover:border-calm-lavender-300 dark:hover:border-calm-lavender-600">
                        <div class="p-3 rounded-xl
                                    bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-600/30 dark:to-orange-500/20
                                    text-orange-600 dark:text-orange-400">
                            <FlameIcon class="h-5 w-5" />
                        </div>
                        <div class="flex flex-col leading-none justify-center">
                            <span class="font-dosis text-[0.7rem] md:text-sm font-bold uppercase tracking-widest text-platinum-500 dark:text-platinum-400 mb-0.5">Streak</span>
                            <span class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-100">
                                {{ auth.user?.gamification?.streak || 0 }}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- ════════════════════════════════════════
                 ANNOUNCEMENTS
                 Amber-tinted panel — signals importance
            ════════════════════════════════════════ -->
            <section class="announcements-panel">
                <div class="flex items-center gap-4 mb-6">
                    <div class="p-3 rounded-xl
                                bg-amber-100 dark:bg-amber-500/20
                                border-2 border-amber-200 dark:border-amber-500/30
                                text-amber-600 dark:text-amber-400 shadow-sm">
                        <BellRingIcon class="w-6 h-6" />
                    </div>
                    <h2 class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-50">
                        Latest <span class="text-amber-600 dark:text-amber-400">Updates</span>
                    </h2>
                </div>

                <div v-if="visibleAnnouncements.length > 0"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div v-for="ann in visibleAnnouncements" :key="ann.id"
                        class="item-card !p-6 group cursor-pointer hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md border border-platinum-200/50 dark:border-abyss-700/50">

                        <!-- Priority badge -->
                        <div class="flex items-center gap-3 mb-4">
                            <span :class="[
                                'badge text-[0.7rem] uppercase tracking-widest font-bold',
                                ann.priority === 'urgent' ? 'badge-red' :
                                    ann.priority === 'high' ? 'badge-orange' :
                                        'badge-muted'
                            ]">{{ ann.priority || 'Normal' }}</span>
                        </div>

                        <!-- Announcement title: gamified heading → font-madimione -->
                        <h4 class="font-madimione text-lg md:text-xl
                                    text-abyss-900 dark:text-platinum-50
                                    leading-snug mb-3
                                    group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400
                                    transition-colors">
                            {{ ann.title }}
                        </h4>

                        <!-- Announcement body: GAD/VAWC-safe empathetic copy → font-mplusrounded + leading-relaxed -->
                        <p class="font-mplusrounded text-[0.95rem] leading-relaxed line-clamp-3 mb-5
                                   text-platinum-600 dark:text-platinum-300 font-medium">
                            {{ ann.content }}
                        </p>

                        <!-- Date meta footer -->
                        <div class="ann-meta-footer border-t border-platinum-100 dark:border-white/5 pt-4 mt-auto">
                            <div class="flex flex-col gap-2 font-dosis font-semibold tracking-wide text-[0.8rem] text-platinum-500 uppercase">
                                <div class="flex items-center gap-2">
                                    <CalendarDaysIcon class="h-4 w-4 shrink-0" />
                                    <span>
                                        {{ ann.updatedAt && ann.updatedAt !== ann.createdAt
                                            ? 'Updated: ' + formatFullDate(ann.updatedAt)
                                            : 'Posted: ' + formatFullDate(ann.createdAt) }}
                                    </span>
                                </div>
                                <div v-if="ann.expires_at" class="flex items-center gap-2 ann-expiry text-amber-600/80">
                                    <ClockIcon class="h-4 w-4 shrink-0" />
                                    <span>Expires: {{ formatFullDate(ann.expires_at) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty announcements -->
                <div v-else class="text-center py-10 bg-platinum-50/50 dark:bg-abyss-900/20 rounded-2xl border border-dashed border-platinum-200 dark:border-abyss-700">
                    <p class="font-mplusrounded text-lg font-medium leading-relaxed
                               text-platinum-500 dark:text-platinum-500">
                        No new announcements at this time.
                    </p>
                </div>
            </section>

            <!-- ════════════════════════════════════════
                 DAILY FACT BANNER
                 GAD/VAWC context — empathetic typography mandatory
            ════════════════════════════════════════ -->
            <div class="fact-banner flex items-start gap-4 bg-calm-lavender-50/50 dark:bg-calm-lavender-950/20 p-5 rounded-2xl border border-calm-lavender-100 dark:border-calm-lavender-900/50">
                <div class="p-3.5 rounded-xl shrink-0 mt-0.5
                            bg-calm-lavender-100 dark:bg-calm-lavender-900/30
                            border-2 border-calm-lavender-200 dark:border-calm-lavender-700/40
                            text-calm-lavender-600 dark:text-calm-lavender-400 shadow-sm">
                    <GraduationCapIcon class="h-7 w-7" />
                </div>
                <div class="flex-1">
                    <!-- Label: technical micro-UI → font-dosis -->
                    <span class="font-dosis text-[0.75rem] font-bold uppercase tracking-[0.2em] mb-2 block
                                  text-calm-lavender-600 dark:text-calm-lavender-400">
                        Daily Fact
                    </span>
                    <!-- Fact body: GAD/VAWC-safe → font-mplusrounded + leading-relaxed + italic -->
                    <p class="font-mplusrounded text-lg md:text-xl font-medium leading-relaxed italic
                               text-abyss-900 dark:text-platinum-100 mb-1">
                        "{{ currentFact }}"
                    </p>
                </div>
            </div>

            <!-- ════════════════════════════════════════
                 PERSONALIZED GUIDANCE
            ════════════════════════════════════════ -->
            <section class="guidance-panel rounded-2xl p-6 md:p-7 border border-emerald-200/70 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-white to-calm-lavender-50 dark:from-emerald-950/20 dark:via-abyss-800 dark:to-calm-lavender-950/10">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p class="font-dosis text-[0.75rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                            Personalized Guidance
                        </p>
                        <h3 class="mt-1 font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-50">
                            Support based on your latest assessment
                        </h3>
                        <p class="mt-2 font-mplusrounded text-sm md:text-base leading-relaxed text-platinum-600 dark:text-platinum-300 max-w-3xl">
                            These suggestions are tailored from your assessment responses so you can see what the system noticed, what to do next, and where to get help.
                        </p>
                    </div>

                    <span
                        v-if="latestAssessmentGuidance?.overallRiskLevel"
                        class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                        :class="riskBadgeClass(latestAssessmentGuidance.overallRiskLevel)"
                    >
                        {{ latestAssessmentGuidance.overallRiskLevel }} Risk
                    </span>
                </div>

                <div v-if="guidanceLoading" class="mt-6 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800/40 bg-white/70 dark:bg-abyss-900/30 p-5 text-sm text-platinum-500 dark:text-platinum-400">
                    Loading your guidance...
                </div>

                <div v-else-if="guidanceError" class="mt-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-5 text-sm text-red-700 dark:text-red-300">
                    {{ guidanceError }}
                </div>

                <div v-else-if="latestAssessmentGuidance" class="mt-6 grid gap-4 lg:grid-cols-3">
                    <article class="rounded-2xl border border-emerald-200/70 dark:border-emerald-700/40 bg-white/80 dark:bg-abyss-900/40 p-5 shadow-sm">
                        <p class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Recommendation</p>
                        <p class="mt-2 font-mplusrounded text-sm md:text-[0.95rem] leading-relaxed text-abyss-800 dark:text-platinum-200">
                            {{ latestAssessmentGuidance.studentRecommendation?.recommendationText || latestAssessmentGuidance.studentRecommendation?.summary || 'Keep checking in with your support network and facilitator.' }}
                        </p>
                        <div v-if="latestAssessmentGuidance.studentRecommendation?.reasonParts?.length" class="mt-3 flex flex-wrap gap-2">
                            <span v-for="(part, index) in latestAssessmentGuidance.studentRecommendation.reasonParts" :key="index" class="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/25 px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-200">
                                {{ part }}
                            </span>
                        </div>
                    </article>

                    <article class="rounded-2xl border border-calm-lavender-200 dark:border-calm-lavender-700/40 bg-white/80 dark:bg-abyss-900/40 p-5 shadow-sm">
                        <p class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-calm-lavender-600 dark:text-calm-lavender-400">Quote</p>
                        <p class="mt-2 font-mplusrounded text-sm md:text-[0.95rem] leading-relaxed italic text-abyss-800 dark:text-platinum-200">
                            “{{ guidanceQuote }}”
                        </p>
                        <p class="mt-3 text-xs uppercase tracking-[0.2em] text-platinum-500 dark:text-platinum-400">
                            {{ guidanceQuoteSource }}
                        </p>
                    </article>

                    <article class="rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-white/80 dark:bg-abyss-900/40 p-5 shadow-sm">
                        <p class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Help</p>
                        <ul class="mt-3 space-y-2 font-mplusrounded text-sm leading-relaxed text-abyss-800 dark:text-platinum-200">
                            <li v-for="(helpItem, index) in guidanceHelpItems" :key="index" class="flex items-start gap-2">
                                <span class="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                                <span>{{ helpItem }}</span>
                            </li>
                        </ul>
                    </article>
                </div>

                <div v-if="latestAssessmentGuidance" class="mt-4 rounded-2xl border border-slate-200/80 dark:border-abyss-700/40 bg-white/75 dark:bg-abyss-900/30 p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">From Your Assessment</p>
                            <p class="mt-1 font-mplusrounded text-sm text-slate-600 dark:text-platinum-300">These details are taken from your last answered assessment so you can see what the system focused on.</p>
                        </div>
                        <div class="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em]">
                            <span class="rounded-full bg-calm-lavender-100 text-calm-lavender-700 dark:bg-calm-lavender-500/20 dark:text-calm-lavender-200 px-3 py-1">Age band: {{ studentAgeBand }}</span>
                            <span class="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 px-3 py-1">Answers: {{ latestAssessmentGuidance.totalAnswersAnalyzed || 0 }}</span>
                            <span class="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-1">Concerning: {{ latestAssessmentGuidance.concerningAnswersCount || 0 }}</span>
                            <span class="rounded-full bg-calm-lavender-100 text-calm-lavender-700 dark:bg-calm-lavender-500/20 dark:text-calm-lavender-200 px-3 py-1">Category: {{ latestAssessmentGuidance.dominantCategory || 'N/A' }}</span>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                        <span
                            v-for="(behavior, index) in assessmentSnapshot.behaviors"
                            :key="index"
                            class="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-abyss-700 bg-slate-50 dark:bg-abyss-800 px-3 py-1 text-xs text-slate-600 dark:text-platinum-300"
                        >
                            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                            {{ behavior.label }} <span class="text-slate-400 dark:text-platinum-500">({{ behavior.count }})</span>
                        </span>
                        <span v-if="!assessmentSnapshot.behaviors.length" class="text-sm text-slate-500 dark:text-platinum-400">No specific signal stood out strongly from your answers.</span>
                    </div>
                </div>

                <div v-else class="mt-6 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800/40 bg-white/70 dark:bg-abyss-900/30 p-5">
                    <p class="font-mplusrounded text-sm text-platinum-600 dark:text-platinum-300">
                        Take the Behavioral Pattern &amp; Risk Check to unlock personalized guidance, supportive quotes, and next-step help.
                    </p>
                    <router-link :to="{ name: 'user.behavioral-assessment' }" class="inline-flex mt-4 items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-emerald-700 transition-colors">
                        Start assessment
                    </router-link>
                </div>
            </section>

            <!-- ════════════════════════════════════════
                 QUICK ACTIONS
            ════════════════════════════════════════ -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <router-link v-for="action in userQuickActions" :key="action.label"
                    :to="{ name: action.name }"
                    class="quick-action-card group flex items-center gap-4 bg-white dark:bg-abyss-800/80 p-4 rounded-2xl border border-platinum-200 dark:border-abyss-700 shadow-sm hover:shadow-md hover:border-calm-lavender-400 transition-all duration-300 hover:-translate-y-0.5">
                    <div :class="`quick-action-icon p-3 rounded-lg flex items-center justify-center shrink-0 ${action.bg}`">
                        <component :is="action.icon" class="h-6 w-6 text-white" />
                    </div>
                    <!-- Action label: technical nav → font-dosis -->
                    <span class="font-dosis text-[0.95rem] md:text-base font-bold uppercase tracking-wide
                                  text-abyss-900 dark:text-platinum-50
                                  group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-300
                                  transition-colors">
                        {{ action.label }}
                    </span>
                </router-link>
            </div>

            <!-- ════════════════════════════════════════
                 MAIN GRID  (XP Progress + Leaderboard + Videos)
            ════════════════════════════════════════ -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <!-- ── XP Progress + Stats (col 8) ── -->
                <div class="lg:col-span-8 space-y-7">

                    <!-- XP Progress card -->
                    <div class="card p-6 md:p-8 bg-white dark:bg-abyss-800 rounded-3xl shadow-sm border border-platinum-200 dark:border-abyss-700 relative overflow-hidden">
                        <!-- Background glow effect -->
                        <div class="absolute -top-24 -right-24 w-64 h-64 bg-calm-lavender-500/10 dark:bg-calm-lavender-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div class="flex items-center gap-4 mb-8">
                            <div class="h-8 w-2 rounded-full shrink-0
                                         bg-calm-lavender-600 dark:bg-calm-lavender-500"></div>
                            <h3 class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-50">
                                Your Progress
                            </h3>
                        </div>

                        <div class="space-y-6">
                            <div class="flex flex-col md:flex-row md:justify-between md:items-end gap-5 relative z-10">
                                <div>
                                    <!-- XP label: technical → font-dosis -->
                                    <p class="font-dosis text-[0.8rem] font-bold uppercase tracking-[0.2em] mb-2
                                               text-platinum-500 dark:text-platinum-400">
                                        Total Experience
                                    </p>
                                    <!-- XP value: gamified hero number → font-madimione -->
                                    <p class="font-madimione text-6xl md:text-7xl tracking-tighter leading-none
                                               text-transparent bg-clip-text bg-gradient-to-br from-abyss-900 to-calm-lavender-800 dark:from-platinum-50 dark:to-calm-lavender-300 drop-shadow-sm">
                                        {{ auth.user?.gamification?.experience_points?.toLocaleString() || 0 }}
                                        <span class="text-3xl lg:text-4xl tracking-normal text-calm-lavender-500 dark:text-calm-lavender-400 font-bold -ml-1">XP</span>
                                    </p>
                                </div>
                                <div class="text-left md:text-right mt-2 md:mt-0">
                                    <!-- Level label: technical → font-dosis -->
                                    <p class="font-dosis text-[0.8rem] font-bold uppercase tracking-[0.2em] mb-2
                                               text-calm-lavender-500 dark:text-calm-lavender-400">
                                        Level {{ auth.user?.gamification?.level || 1 }}
                                    </p>
                                    <!-- Percent: gamified stat → font-madimione -->
                                    <p class="font-madimione text-4xl leading-none text-abyss-800 dark:text-platinum-100">
                                        {{ xpProgressPercent }}<span class="text-2xl text-platinum-400 dark:text-platinum-500">%</span>
                                    </p>
                                </div>
                            </div>
                            <!-- XP bar -->
                            <div class="progress-track h-4 bg-platinum-100 dark:bg-abyss-950 rounded-full overflow-hidden shadow-inner relative z-10">
                                <div class="progress-fill h-full bg-gradient-to-r from-calm-lavender-400 to-calm-lavender-600 dark:from-calm-lavender-600 dark:to-calm-lavender-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)] transition-all duration-1000 ease-out"
                                    :style="{ width: xpProgressPercent + '%' }">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stats grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div v-for="stat in mainStats" :key="stat.label" class="item-card !p-6 md:!p-7 text-center bg-white dark:bg-abyss-800 border border-platinum-200 dark:border-abyss-700 shadow-sm rounded-3xl hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 transition duration-300 hover:shadow-md hover:-translate-y-1">
                            <div class="flex justify-center mb-5">
                                <div class="p-3.5 rounded-2xl
                                            bg-calm-lavender-50 dark:bg-calm-lavender-900/30
                                            border-2 border-calm-lavender-100 dark:border-calm-lavender-800/50
                                            text-calm-lavender-600 dark:text-calm-lavender-400 shadow-sm">
                                    <component :is="stat.icon" class="h-6 w-6" />
                                </div>
                            </div>
                            <!-- Stat value: gamified → font-madimione -->
                            <p class="font-madimione text-4xl text-abyss-900 dark:text-platinum-50 mb-2">
                                {{ stat.val }}
                            </p>
                            <!-- Stat label: technical micro-UI → font-dosis -->
                            <p class="font-dosis text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-[0.15em]
                                       text-platinum-500 dark:text-platinum-400 mb-1">
                                {{ stat.label }}
                            </p>
                            <!-- Stat sub: empathetic helper text → font-mplusrounded -->
                            <p class="font-mplusrounded text-[0.8rem] font-semibold mt-0.5
                                       text-platinum-400 dark:text-platinum-500">
                                {{ stat.sub }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- ── Leaderboard (col 4) ── -->
                <div class="lg:col-span-4 lg:sticky lg:top-8">
                    <div class="card p-6 border border-platinum-200 dark:border-abyss-700 shadow-sm rounded-3xl bg-white dark:bg-abyss-800">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="p-3 rounded-xl
                                        bg-amber-100 dark:bg-amber-500/20
                                        border border-amber-200 dark:border-amber-500/30
                                        text-amber-500 dark:text-amber-400 shadow-sm">
                                <TrophyIcon class="h-6 w-6" />
                            </div>
                            <h3 class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-50">
                                Top <span class="text-amber-600 dark:text-amber-400">Learners</span>
                            </h3>
                        </div>

                        <div class="space-y-3">
                            <div v-for="(player, index) in leaderboard.slice(0, 5)" :key="index"
                                class="leaderboard-row group p-3 rounded-2xl bg-platinum-50 dark:bg-abyss-900/50 border border-transparent hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300"
                                :class="player.id === auth.user?.id ? '!bg-amber-50/50 dark:!bg-amber-950/20 border-amber-200 dark:border-amber-900/50 shadow-sm' : ''">
                                <div class="flex items-center gap-3">
                                    <div class="rank-badge shadow-sm w-8 h-8 flex items-center justify-center font-madimione text-lg"
                                        :class="index === 0 ? 'rank-badge--gold !bg-gradient-to-br !from-yellow-300 !to-yellow-500 !text-yellow-900' : index === 1 ? 'rank-badge--silver !bg-gradient-to-br !from-slate-200 !to-slate-400 !text-slate-800' : index === 2 ? 'rank-badge--bronze !bg-gradient-to-br !from-amber-500 !to-amber-700 !text-white' : 'bg-white dark:bg-abyss-800 text-platinum-500 dark:text-platinum-400 border border-platinum-200 dark:border-abyss-700'">
                                        {{ index + 1 }}
                                    </div>
                                    <!-- Player name: technical nav → font-dosis -->
                                    <span class="font-dosis text-[0.95rem] font-bold tracking-wide truncate max-w-[120px]
                                                  text-abyss-800 dark:text-platinum-100
                                                  group-hover:text-amber-600 dark:group-hover:text-amber-400
                                                  transition-colors">
                                        {{ player.name }}
                                        <span v-if="player.id === auth.user?.id" class="ml-1 text-[0.6rem] uppercase tracking-widest text-amber-500/80">(You)</span>
                                    </span>
                                </div>
                                <span class="font-madimione text-lg text-amber-600 dark:text-amber-400 tracking-wide">{{ formatXP(player.points) }} <span class="text-xs text-amber-600/60 dark:text-amber-400/60 leading-none">XP</span></span>
                            </div>
                        </div>

                        <button @click="isLeaderboardOpen = true" class="btn-primary w-full justify-center mt-7 shadow-md font-dosis font-bold tracking-widest uppercase text-sm h-12">
                            <span class="main-button-text">View Global Rankings</span>
                        </button>
                    </div>
                </div>

                <!-- ── Featured Learning (Recommended Resources) — full width ── -->
                <div class="lg:col-span-12">
                    <section class="space-y-6">
                        <div class="flex flex-wrap items-center gap-4 py-2 justify-between">
                            <div class="flex items-center gap-4">
                                <div class="h-8 w-2 bg-neon-pink-500 rounded-full shrink-0"></div>
                                <h3 class="font-madimione text-2xl md:text-3xl text-abyss-900 dark:text-platinum-50">
                                    Featured Learning
                                </h3>
                            </div>
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <span class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-platinum-500 dark:text-platinum-400">Content</span>
                                    <select v-model="resourceContent" class="rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 px-3 py-2 text-xs text-abyss-700 dark:text-platinum-100">
                                        <option value="all">All</option>
                                        <option value="video">Videos</option>
                                        <option value="article">Articles</option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="font-dosis text-[0.7rem] font-bold uppercase tracking-[0.2em] text-platinum-500 dark:text-platinum-400">Sort</span>
                                    <select v-model="resourceSort" class="rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 px-3 py-2 text-xs text-abyss-700 dark:text-platinum-100">
                                    <option value="newest">Newest</option>
                                    <option value="title_asc">Title (A–Z)</option>
                                    <option value="title_desc">Title (Z–A)</option>
                                    <option value="type">Type</option>
                                    <option value="source">Source</option>
                                </select>
                            </div>
                            </div>
                        </div>

                        <div v-if="isResourcesLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div v-for="i in 4" :key="i" class="h-[300px] rounded-3xl bg-platinum-100 dark:bg-abyss-800 border border-platinum-200 dark:border-abyss-700 animate-pulse" />
                        </div>

                        <div v-else-if="recommendedResources.length === 0" class="rounded-3xl border border-dashed border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-8 text-center">
                            <p class="font-mplusrounded text-sm text-platinum-500 dark:text-platinum-400 font-semibold">No suggested resources right now.</p>
                            <p class="mt-2 font-mplusrounded text-xs text-platinum-400 dark:text-platinum-500">Check the Resource Center for more materials.</p>
                        </div>

                        <div v-else class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div v-for="item in sortedRecommendedResources" :key="item.key"
                                class="video-card group rounded-3xl overflow-hidden border border-platinum-200 dark:border-abyss-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-abyss-800 relative flex flex-col">

                                <div class="relative h-44 w-full bg-platinum-200 dark:bg-abyss-700 overflow-hidden shrink-0">
                                    <div class="absolute inset-0 bg-gradient-to-t from-abyss-900/80 via-abyss-900/20 to-transparent group-hover:via-abyss-900/40 transition-colors duration-300"></div>

                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div class="play-btn w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center group-hover:bg-neon-pink-500 transition-colors duration-300 border border-white/30 group-hover:border-neon-pink-400 group-hover:scale-110">
                                            <component :is="resourceActionIcon(item)" class="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <button
                                        class="absolute top-3 left-3 w-9 h-9 rounded-xl bg-abyss-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-abyss-900/75 transition"
                                        @click.stop="toggleResourceMenu(item.key)"
                                        aria-label="Resource options"
                                    >
                                        <MoreVerticalIcon class="h-4 w-4" />
                                    </button>

                                    <div v-if="openResourceMenuId === item.key" class="absolute top-14 left-3 z-20 w-44 rounded-2xl border border-platinum-200/40 bg-white/95 dark:bg-abyss-900/95 backdrop-blur-md shadow-lg overflow-hidden">
                                        <button @click.stop="openResource(item)" class="w-full text-left px-4 py-3 text-xs font-dosis font-black uppercase tracking-[0.2em] text-abyss-800 dark:text-platinum-100 hover:bg-platinum-50 dark:hover:bg-abyss-800">
                                            Go to site
                                        </button>
                                        <button @click.stop="dismissResource(item)" class="w-full text-left px-4 py-3 text-xs font-dosis font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                            Remove suggestion
                                        </button>
                                    </div>

                                    <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg
                                                  font-dosis text-[0.65rem] font-bold uppercase tracking-widest
                                                  bg-calm-lavender-600/90 backdrop-blur-md text-white border border-calm-lavender-400/50 shadow-sm z-10">
                                        {{ item.type }}
                                    </span>

                                    <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg
                                                  font-dosis text-[0.65rem] font-bold uppercase tracking-widest
                                                  bg-abyss-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
                                        {{ resourceSource(item) }}
                                    </span>
                                </div>

                                <div class="p-5 flex flex-col flex-1">
                                    <p class="font-dosis text-[0.7rem] font-black uppercase tracking-[0.2em] text-platinum-500 dark:text-platinum-400 mb-2">
                                        {{ resourceContentLabel(item) }} <span class="text-platinum-300 dark:text-abyss-600">•</span> {{ item.type || 'resource' }}
                                    </p>
                                    <h4 class="font-madimione text-lg lg:text-[1.15rem] leading-snug line-clamp-2 mb-2
                                                text-abyss-900 dark:text-platinum-50
                                                group-hover:text-neon-pink-500 dark:group-hover:text-neon-pink-400
                                                transition-colors">
                                        {{ item.title }}
                                    </h4>
                                    <p class="font-mplusrounded text-[0.85rem] leading-relaxed line-clamp-2 mb-4
                                               text-platinum-500 dark:text-platinum-400 font-medium">
                                        {{ item.description || 'No description provided.' }}
                                    </p>
                                    <button @click="openResource(item)" class="mt-auto text-left">
                                        <span class="font-dosis text-xs font-black uppercase tracking-[0.2em]
                                                      text-calm-lavender-600 dark:text-calm-lavender-400
                                                      group-hover:text-neon-pink-500 dark:group-hover:text-neon-pink-400
                                                      flex items-center gap-1 transition-colors">
                                            {{ resourceActionLabel(item) }} <ChevronRightIcon class="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between">
                                <button
                                    class="px-4 py-2 rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 text-xs font-dosis font-black uppercase tracking-[0.2em] text-abyss-700 dark:text-platinum-100 disabled:opacity-50"
                                    :disabled="resourcePage <= 1 || isResourcesLoading"
                                    @click="prevResourcesPage"
                                >
                                    Previous
                                </button>

                                <div class="text-center">
                                    <p class="font-dosis text-[0.7rem] font-black uppercase tracking-[0.2em] text-platinum-500 dark:text-platinum-400">
                                        Page {{ resourcePage }}
                                    </p>
                                </div>

                                <button
                                    class="px-4 py-2 rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 text-xs font-dosis font-black uppercase tracking-[0.2em] text-abyss-700 dark:text-platinum-100 disabled:opacity-50"
                                    :disabled="!resourceHasMore || isResourcesLoading"
                                    @click="nextResourcesPage"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

            </div><!-- /main grid -->

            <LeaderboardModal :isOpen="isLeaderboardOpen" @close="isLeaderboardOpen = false" />

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useModuleStore } from '@/stores/module'
import api from '@/utils/api'
import LeaderboardModal from '@/components/ui/LeaderboardModal.vue'
import {
    Play as PlayIcon, ShieldCheck as ShieldCheckIcon, ShieldAlert, Trophy as TrophyIcon,
    BellRing as BellRingIcon, Flame as FlameIcon, ChevronRight as ChevronRightIcon,
    CheckCircle as CheckCircleIcon, Library as LibraryIcon,
    Zap as ZapIcon, GraduationCapIcon, ClipboardListIcon, ActivityIcon, BookOpenIcon, UserIcon,
    Clock as ClockIcon, CalendarDays as CalendarDaysIcon,
    MoreVertical as MoreVerticalIcon
} from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const profileStore = useProfileStore()
const moduleStore = useModuleStore()

// State
const leaderboard = ref([])
const isLeaderboardOpen = ref(false)
const announcements = ref([])
const userBadgesCount = ref(0)
const now = ref(new Date())
let refreshTimer = null

// Only show non-expired, active announcements — re-evaluated every minute via `now`
const visibleAnnouncements = computed(() =>
    announcements.value.filter(ann => {
        if (!ann.expires_at) return true
        return new Date(ann.expires_at) > now.value
    })
)

const recommendedResources = ref([])
const isResourcesLoading = ref(false)
const resourceSort = ref('newest')
const resourceContent = ref('all')
const resourcePage = ref(1)
const resourceHasMore = ref(false)
const openResourceMenuId = ref(null)
const latestAssessmentGuidance = ref(null)
const guidanceLoading = ref(false)
const guidanceError = ref('')

const guidanceCopyByRisk = {
    Low: {
        quote: 'You are building awareness early, and that is a strong first step.',
        source: 'Keep reflecting on what helps you stay steady.'
    },
    Moderate: {
        quote: 'Small changes and honest check-ins can prevent stress from building up.',
        source: 'Use short breaks and reach out early.'
    },
    High: {
        quote: 'When the load feels heavy, asking for support is a strength, not a failure.',
        source: 'Talk to a trusted facilitator or support contact.'
    },
    Severe: {
        quote: 'Your safety and well-being come first, and you deserve immediate support.',
        source: 'Connect with a trusted adult or facilitator now.'
    }
}

const safeUrlHost = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '')
    } catch {
        return ''
    }
}

const isVideoLink = (url) => {
    const host = safeUrlHost(url)
    return host.includes('youtube.com') || host.includes('youtu.be') || host.includes('vimeo.com')
}

const resourceSource = (item) => {
    if (item?.source) return String(item.source)
    const host = safeUrlHost(item.link_url)
    if (!host) return 'Link'
    const parts = host.split('.')
    return parts.length >= 2 ? parts.slice(-2).join('.') : host
}

const resourceContentKind = (item) => {
    const fromApi = String(item?.content_kind || '').toLowerCase()
    if (fromApi === 'video' || fromApi === 'article') return fromApi
    return isVideoLink(item.link_url) ? 'video' : 'article'
}

const resourceContentLabel = (item) => (resourceContentKind(item) === 'video' ? 'Video' : 'Article')
const resourceActionLabel = (item) => (resourceContentKind(item) === 'video' ? 'Watch' : 'Read')
const resourceActionIcon = (item) => (resourceContentKind(item) === 'video' ? PlayIcon : BookOpenIcon)

const riskBadgeClass = (risk) => {
    if (risk === 'Severe') return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200'
    if (risk === 'High') return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200'
    if (risk === 'Moderate') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
}

const guidanceQuote = computed(() => {
    const risk = latestAssessmentGuidance.value?.overallRiskLevel || 'Low'
    return guidanceCopyByRisk[risk]?.quote || guidanceCopyByRisk.Low.quote
})

const guidanceQuoteSource = computed(() => {
    const risk = latestAssessmentGuidance.value?.overallRiskLevel || 'Low'
    return guidanceCopyByRisk[risk]?.source || guidanceCopyByRisk.Low.source
})

const guidanceHelpItems = computed(() => {
    const recommendation = latestAssessmentGuidance.value?.studentRecommendation
    const risk = latestAssessmentGuidance.value?.overallRiskLevel || 'Low'
    const items = []

    if (recommendation?.seminarRecommended) {
        items.push('Join the recommended seminar or facilitator check-in to talk through the patterns in your answers.')
    } else {
        items.push('Keep monitoring the patterns that showed up in your responses and note what makes stress easier or harder.')
    }

    if (recommendation?.reasonParts?.some(part => /family|support/i.test(part))) {
        items.push('If family or support-system stress is involved, reach out to one trusted person who can listen without judgment.')
    }

    if (recommendation?.reasonParts?.some(part => /unsafe|pressure|controlled/i.test(part))) {
        items.push('If you feel unsafe or pressured, prioritize immediate support and report it to a trusted facilitator or guardian.')
    }

    if (recommendation?.reasonParts?.some(part => /overload|withdrawal|anxious/i.test(part))) {
        items.push('Take short breaks, breathe slowly, and give yourself space before answering or deciding anything important.')
    }

    if (!items.length) {
        items.push('Use the Purple Desk or your facilitator if you want help understanding the result.')
    }

    if (risk === 'Severe') {
        items.unshift('If you feel at immediate risk, contact a trusted adult or facilitator right away.')
    }

    return items.slice(0, 4)
})

const assessmentSnapshot = computed(() => ({
    answers: latestAssessmentGuidance.value?.totalAnswersAnalyzed || 0,
    concerning: latestAssessmentGuidance.value?.concerningAnswersCount || 0,
    category: latestAssessmentGuidance.value?.dominantCategory || 'N/A',
    behaviors: Array.isArray(latestAssessmentGuidance.value?.topBehaviors) ? latestAssessmentGuidance.value.topBehaviors : []
}))

const studentBirthdate = computed(() => (
    profileStore.profile?.date_of_birth
    || auth.user?.profile?.date_of_birth
    || auth.user?.date_of_birth
    || null
))

const studentAgeBand = computed(() => {
    const dateOfBirth = studentBirthdate.value
    if (!dateOfBirth) return 'Unknown'

    const birthDate = new Date(dateOfBirth)
    if (Number.isNaN(birthDate.getTime())) return 'Unknown'

    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1
    }

    if (age < 13) return 'Below 13'
    if (age <= 15) return '13-15'
    if (age <= 18) return '16-18'
    if (age <= 24) return '19-24'
    if (age <= 34) return '25-34'
    if (age <= 44) return '35-44'
    return '45+'
})

const fetchLatestAssessmentGuidance = async () => {
    guidanceLoading.value = true
    guidanceError.value = ''
    try {
        const { data } = await api.get('/api/v1/ml-analysis/assessment/latest')
        latestAssessmentGuidance.value = data?.analysis || null
    } catch (error) {
        latestAssessmentGuidance.value = null
        guidanceError.value = error?.response?.data?.message || 'Failed to load personalized guidance.'
    } finally {
        guidanceLoading.value = false
    }
}

const sortedRecommendedResources = computed(() => {
    // Sorting is performed by the backend so pagination remains consistent.
    return [...(recommendedResources.value || [])]
})

const toggleResourceMenu = (key) => {
    openResourceMenuId.value = openResourceMenuId.value === key ? null : key
}

const openResource = (item) => {
    openResourceMenuId.value = null
    const url = item.link_url
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
}

const dismissResource = async (item) => {
    try {
        openResourceMenuId.value = null
        await api.post('/api/v1/resources/recommended/dismiss', { key: item.key })
        recommendedResources.value = (recommendedResources.value || []).filter(r => r.key !== item.key)
    } catch (error) {
        console.error('Failed to dismiss resource:', error)
    }
}

const closeResourceMenus = () => {
    openResourceMenuId.value = null
}

const fetchRecommendedResources = async () => {
    try {
        isResourcesLoading.value = true
        const { data } = await api.get('/api/v1/resources/recommended', {
            params: {
                limit: 8,
                page: resourcePage.value,
                sort: resourceSort.value,
                content: resourceContent.value
            }
        })
        const raw = data.resources || []
        recommendedResources.value = raw.map((it) => ({
            ...it,
            key: it.key || (Number.isFinite(Number(it.id)) ? `resource_item:${it.id}` : (it.link_url ? `url:${it.link_url}` : String(Math.random())))
        }))
        resourceHasMore.value = Boolean(data?.meta?.hasMore)
    } catch (error) {
        recommendedResources.value = []
        resourceHasMore.value = false
    } finally {
        isResourcesLoading.value = false
    }
}

const nextResourcesPage = () => {
    if (!resourceHasMore.value) return
    resourcePage.value += 1
}

const prevResourcesPage = () => {
    if (resourcePage.value <= 1) return
    resourcePage.value -= 1
}

const dailyFacts = [
    "The Magna Carta of Women (RA 9710) is a comprehensive women's human rights law that seeks to eliminate discrimination through the recognition, protection, fulfillment and promotion of the rights of Filipino women.",
    "VAWC stands for Violence Against Women and Their Children, covering any act of gender-based violence that results in physical, sexual, or psychological harm.",
    "Consent is a clear, voluntary, and enthusiastic agreement to engage in specific sexual activity. It can be withdrawn at any time.",
    "The Safe Spaces Act (RA 11313) defines and penalizes gender-based sexual harassment in streets, public spaces, online, workplaces, and educational/training institutions.",
    "Gender sensitivity refers to the ability to recognize gender issues and especially the ability to recognize women's different perceptions and interests arising from their different social location and different gender roles."
]
const currentFact = ref(dailyFacts[Math.floor(Math.random() * dailyFacts.length)])

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Unknown time";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const minute = 60;
    const hour = 3600;
    const day = 86400;
    if (diffInSeconds < 30) return "Just now";
    if (diffInSeconds < minute) return `${diffInSeconds}s ago`;
    if (diffInSeconds < hour) return `${Math.floor(diffInSeconds / minute)}m ago`;
    if (diffInSeconds < day) return `${Math.floor(diffInSeconds / hour)}h ago`;
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
    });
};

const formatFullDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
    })
}

const mainStats = computed(() => [
    { label: 'Course Progress', val: `${latestModule.value?.progress || 0}%`, sub: 'Current', icon: ActivityIcon },
    { label: 'Modules Finished', val: completedModulesCount.value, sub: 'Total', icon: CheckCircleIcon },
    { label: 'Inventory', val: userBadgesCount.value, sub: 'Items Earned', icon: TrophyIcon },
    { label: 'Leaderboard', val: `#${userRank.value}`, sub: 'Global Rank', icon: ZapIcon }
])

const userQuickActions = [
    { name: 'user.modules', icon: BookOpenIcon, label: 'Modules', bg: 'bg-calm-lavender-600 dark:bg-calm-lavender-700' },
    { name: 'user.rewards-shop', icon: LibraryIcon, label: 'Rewards', bg: 'bg-neon-pink-600 dark:bg-neon-pink-700' },
    { name: 'classrooms.index', icon: GraduationCapIcon, label: 'Classes', bg: 'bg-safety-teal-600 dark:bg-safety-teal-700' },
    { name: 'user.purple-desk', icon: ShieldAlert, label: 'Purple Desk', bg: 'bg-amber-500 dark:bg-amber-600' },
    { name: 'profile', icon: UserIcon, label: 'Profile', bg: 'bg-abyss-600 dark:bg-abyss-700' }
]

const userFirstName = computed(() => auth.user?.name?.split(' ')[0] || 'Player')
const currentDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
const completedModulesCount = computed(() => moduleStore.modules.filter(m => m.progress >= 100).length)
const latestModule = computed(() => moduleStore.modules.find(m => m.progress > 0 && m.progress < 100) || moduleStore.modules[0])

const userRank = computed(() => {
    if (!leaderboard.value.length) return '?'
    const rank = leaderboard.value.findIndex(p => p.id === auth.user?.id)
    return rank !== -1 ? rank + 1 : '?'
})

const currentGreeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
})

const motivationalMessage = computed(() => {
    const streak = auth.user?.gamification?.streak || 0
    return streak >= 7 ? "Unstoppable streak! Keep it up!" : "Every module counts toward mastery."
})

const xpProgressPercent = computed(() => {
    const xp = auth.user?.gamification?.experience_points || 0
    const level = auth.user?.gamification?.level || 1
    const nextLevelXP = level * 500
    const prevLevelXP = (level - 1) * 500
    const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100
    return Math.min(Math.max(Math.round(progress), 0), 100)
})

const formatXP = (xp) => xp >= 1000 ? (xp / 1000).toFixed(1) + 'k' : xp
const goModule = (id) => router.push({ name: 'user.module', params: { id } })

const fetchAnalytics = async () => {
    try {
        const annRes = await api.get('/api/v1/notifications/announcements')
        announcements.value = annRes.data.announcements || []
    } catch (error) {
        console.error('Failed to fetch announcements:', error)
    }
    try {
        const [lbRes, badgeRes] = await Promise.all([
            api.get('/api/v1/quizzes/gamification/leaderboard'),
            api.get('/api/v1/badges/my-inventory')
        ])
        leaderboard.value = lbRes.data.learners || []
        userBadgesCount.value = badgeRes.data?.inventory?.length || 0
    } catch (error) { console.error('Analytics fetch error:', error) }
}

onMounted(() => {
    moduleStore.fetchModules()
    fetchAnalytics()
    profileStore.fetchProfile('me').catch(() => {})
    fetchLatestAssessmentGuidance()
    fetchRecommendedResources()
    // Tick `now` every 60s so visibleAnnouncements re-evaluates without a page reload
    refreshTimer = setInterval(() => { now.value = new Date() }, 60_000)

    window.addEventListener('click', closeResourceMenus)
})

onUnmounted(() => {
    window.removeEventListener('click', closeResourceMenus)
    clearInterval(refreshTimer)
})

watch([resourceSort, resourceContent], () => {
    resourcePage.value = 1
    fetchRecommendedResources()
})

watch(resourcePage, () => {
    fetchRecommendedResources()
})
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   PAGE WRAPPER  —  bg-platinum-50 / abyss-800 foundation
═══════════════════════════════════════════════════════════ */
.page-wrapper {
    @apply min-h-screen p-6 md:p-10;
    @apply bg-platinum-50 dark:bg-abyss-800;
}

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENTS PANEL
   Amber-tinted L1 — signals importance
═══════════════════════════════════════════════════════════ */
.announcements-panel {
    @apply rounded-2xl p-6;
    @apply bg-amber-50 dark:bg-abyss-800;
    @apply border-2 border-amber-200 dark:border-amber-500/30;
}

/* ═══════════════════════════════════════════════════════════
   DAILY FACT BANNER
   Lavender L1 with left accent border
═══════════════════════════════════════════════════════════ */
.fact-banner {
    @apply flex items-start gap-5 p-5 rounded-2xl;
    @apply bg-calm-lavender-50 dark:bg-abyss-700;
    @apply border-2 border-calm-lavender-200 dark:border-calm-lavender-700/40;
    border-left-width: 5px;
    border-left-color: theme('colors.calm-lavender.600');
}

.dark .fact-banner {
    border-left-color: theme('colors.calm-lavender.500');
}

/* ═══════════════════════════════════════════════════════════
   STAT CHIP
═══════════════════════════════════════════════════════════ */
.stat-chip {
    @apply flex items-center gap-3 px-4 py-3 rounded-2xl;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply transition-colors duration-150;
}

/* ═══════════════════════════════════════════════════════════
   QUICK ACTION CARD
   Flat-3D depth via border-bottom
═══════════════════════════════════════════════════════════ */
.quick-action-card {
    @apply flex items-center gap-4 px-4 py-4 rounded-2xl no-underline transition-all duration-150;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    border-bottom-width: 4px;
    border-bottom-color: theme('colors.platinum.400');
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply hover:-translate-y-0.5;
}

.dark .quick-action-card {
    border-bottom-color: theme('colors.abyss.900');
}

.quick-action-icon {
    @apply p-2.5 rounded-xl shrink-0;
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
}

/* ═══════════════════════════════════════════════════════════
   LEADERBOARD ROW
═══════════════════════════════════════════════════════════ */
.leaderboard-row {
    @apply flex items-center justify-between px-3.5 py-2.5 rounded-xl;
    @apply bg-platinum-200 dark:bg-abyss-800;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply transition-colors duration-150;
}

.leaderboard-row--me {
    background-color: theme('colors.calm-lavender.50') !important;
    border-color: theme('colors.calm-lavender.400') !important;
}

.dark .leaderboard-row--me {
    background-color: rgba(92, 68, 168, 0.12) !important;
    border-color: theme('colors.calm-lavender.600') !important;
}

/* ═══════════════════════════════════════════════════════════
   RANK BADGE
═══════════════════════════════════════════════════════════ */
.rank-badge {
    @apply w-7 h-7 flex items-center justify-center rounded-full shrink-0;
    @apply bg-platinum-300 dark:bg-abyss-600;
    @apply font-dosis text-xs font-bold text-abyss-600 dark:text-platinum-400;
}

.rank-badge--gold   { background: #fef3c7; color: #d97706; border: 1.5px solid #fbbf24; }
.rank-badge--silver { background: #f3f4f6; color: #6b7280; border: 1.5px solid #d1d5db; }
.rank-badge--bronze { background: #fdf4ed; color: #b45309; border: 1.5px solid #f59e0b; }

/* ═══════════════════════════════════════════════════════════
   XP BADGE
═══════════════════════════════════════════════════════════ */
.xp-badge {
    @apply font-dosis text-xs font-bold px-2 py-0.5 rounded-lg;
    @apply bg-calm-lavender-100 dark:bg-calm-lavender-900/20;
    @apply text-calm-lavender-700 dark:text-calm-lavender-300;
    border: 1.5px solid theme('colors.calm-lavender.200');
}

.dark .xp-badge {
    border-color: rgba(92, 68, 168, 0.35);
}

/* ═══════════════════════════════════════════════════════════
   VIDEO CARD
═══════════════════════════════════════════════════════════ */
.video-card {
    @apply rounded-2xl overflow-hidden no-underline block;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply hover:-translate-y-0.5 transition-all duration-200;
}

/* ═══════════════════════════════════════════════════════════
   PLAY BUTTON OVERLAY
═══════════════════════════════════════════════════════════ */
.play-btn {
    @apply w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200;
    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.5);
}

.group:hover .play-btn {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.35);
}

/* ═══════════════════════════════════════════════════════════
   ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-in {
    animation: fadeSlideUp 0.5s ease-out both;
}

@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENT META FOOTER
═══════════════════════════════════════════════════════════ */
.ann-meta-footer {
    @apply flex flex-col gap-1 pt-3;
    @apply border-t border-amber-200 dark:border-amber-500/20;
    @apply font-dosis text-xs font-medium text-platinum-500 dark:text-platinum-500;
}

.ann-expiry {
    @apply text-vawc-orange-500 dark:text-vawc-orange-400;
}
</style>