<template>
  <div class="p-4 md:p-8 space-y-6 md:space-y-8 min-h-screen bg-slate-50 dark:bg-[#020203] text-black dark:text-white custom-font-poppins transition-colors duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6 md:pb-8 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="h-1.5 w-10 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-[0_2px_10px_rgba(139,92,246,0.4)]"></div>
          <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">AI Analytics Dashboard</h1>
        </div>
        <p class="text-xs text-black/50 dark:text-slate-500 mt-2 uppercase tracking-widest font-bold">VAWC Detection Analysis — Student Quiz Responses</p>
      </div>
      <div class="flex gap-3">
        <button @click="activeTab = 'overview'" :class="tabClass('overview')">
          <BarChart3Icon class="w-4 h-4" /> Overview
        </button>
        <button @click="activeTab = 'results'" :class="tabClass('results')">
          <ListIcon class="w-4 h-4" /> Results
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-500/5 border border-red-500/20 p-10 rounded-[3rem] text-center shadow-xl">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangleIcon class="text-red-500 w-8 h-8" />
      </div>
      <p class="text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">{{ error }}</p>
      <button @click="fetchData" class="mt-6 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Retry</button>
    </div>

    <!-- ==================== OVERVIEW TAB ==================== -->
    <div v-else-if="activeTab === 'overview'" class="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <div class="stat-card bg-white/80 dark:bg-[#0d0d12]/60">
          <div class="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 mb-3">
            <BrainIcon class="w-6 h-6" />
          </div>
          <p class="text-2xl md:text-3xl font-black text-black dark:text-white">{{ stats.totalAnalyses }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-slate-500 mt-1">Total Analyses</p>
        </div>
        <div class="stat-card bg-white/80 dark:bg-[#0d0d12]/60">
          <div class="p-3 bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400 mb-3">
            <FlagIcon class="w-6 h-6" />
          </div>
          <p class="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400">{{ stats.flaggedCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-slate-500 mt-1">Flagged Results</p>
        </div>
        <div class="stat-card bg-white/80 dark:bg-[#0d0d12]/60">
          <div class="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 mb-3">
            <ClockIcon class="w-6 h-6" />
          </div>
          <p class="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">{{ stats.unreviewedCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-slate-500 mt-1">Needs Review</p>
        </div>
        <div class="stat-card bg-white/80 dark:bg-[#0d0d12]/60">
          <div class="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-3">
            <ShieldCheckIcon class="w-6 h-6" />
          </div>
          <p class="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">{{ reviewedCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-slate-500 mt-1">Reviewed</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
        <!-- Risk Distribution -->
        <div class="chart-card">
          <div class="p-6 md:p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-sm font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 italic">Risk Level Distribution</h2>
          </div>
          <div class="p-6 md:p-8">
            <div class="space-y-4">
              <div v-for="(count, level) in riskDistributionSorted" :key="level" class="flex items-center gap-4">
                <span :class="['w-20 text-[10px] font-black uppercase tracking-wider', riskColor(level)]">{{ level }}</span>
                <div class="flex-1 h-8 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div :class="['h-full rounded-full transition-all duration-1000', riskBarColor(level)]"
                    :style="{ width: riskPercent(count) + '%' }"></div>
                </div>
                <span class="text-sm font-black text-black/60 dark:text-slate-400 w-10 text-right">{{ count }}</span>
              </div>
              <div v-if="Object.keys(stats.riskDistribution || {}).length === 0" class="text-center py-8 text-xs text-black/30 dark:text-slate-600 font-bold uppercase tracking-widest italic">
                No data available yet
              </div>
            </div>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="chart-card">
          <div class="p-6 md:p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-sm font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 italic">Detected Categories</h2>
          </div>
          <div class="p-6 md:p-8">
            <div class="space-y-3">
              <div v-for="(count, category) in stats.categoryDistribution" :key="category"
                class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div class="flex items-center gap-3">
                  <div :class="['w-3 h-3 rounded-full', categoryDotColor(category)]"></div>
                  <span class="text-xs font-bold text-black/70 dark:text-slate-300">{{ category }}</span>
                </div>
                <span class="text-sm font-black text-black dark:text-white">{{ count }}</span>
              </div>
              <div v-if="Object.keys(stats.categoryDistribution || {}).length === 0" class="text-center py-8 text-xs text-black/30 dark:text-slate-600 font-bold uppercase tracking-widest italic">
                No data available yet
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Flags -->
      <div class="chart-card" v-if="stats.recentFlags && stats.recentFlags.length > 0">
        <div class="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 italic">Recent Flagged Submissions</h2>
          <button @click="activeTab = 'results'; filterFlagged = true" class="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-400 transition-colors">
            View All →
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/[0.02]">
                <th class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Student</th>
                <th class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Quiz</th>
                <th class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Risk</th>
                <th class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Category</th>
                <th class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="flag in stats.recentFlags" :key="flag.id" class="hover:bg-purple-50/50 dark:hover:bg-white/[0.02] transition-all cursor-pointer" @click="openDetail(flag.id)">
                <td class="px-6 md:px-8 py-4 md:py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                      {{ getInitials(flag.student?.name) }}
                    </div>
                    <span class="font-bold text-sm text-black dark:text-white">{{ flag.student?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="px-6 md:px-8 py-4 md:py-5 text-xs font-bold text-black/60 dark:text-slate-400">{{ flag.quiz?.title || '—' }}</td>
                <td class="px-6 md:px-8 py-4 md:py-5">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase', riskBadgeClass(flag.overall_risk_level)]">
                    {{ flag.overall_risk_level }}
                  </span>
                </td>
                <td class="px-6 md:px-8 py-4 md:py-5 text-xs font-bold text-black/60 dark:text-slate-400">{{ flag.dominant_category }}</td>
                <td class="px-6 md:px-8 py-4 md:py-5 text-[10px] font-bold text-black/40 dark:text-slate-500">{{ formatDate(flag.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== RESULTS TAB ==================== -->
    <div v-else-if="activeTab === 'results'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Filters -->
      <div class="flex flex-wrap gap-3 items-center">
        <select v-model="filterRisk" @change="fetchResults(1)" class="filter-select">
          <option value="">All Risk Levels</option>
          <option value="Severe">Severe</option>
          <option value="High">High</option>
          <option value="Moderate">Moderate</option>
          <option value="Low">Low</option>
        </select>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="filterFlagged" @change="fetchResults(1)" class="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500">
          <span class="text-xs font-bold text-black/60 dark:text-slate-400 uppercase tracking-wider">Flagged Only</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="filterUnreviewed" @change="fetchResults(1)" class="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500">
          <span class="text-xs font-bold text-black/60 dark:text-slate-400 uppercase tracking-wider">Unreviewed Only</span>
        </label>
        <span class="ml-auto text-[10px] font-black text-black/40 dark:text-slate-600 uppercase tracking-widest">{{ resultsTotal }} results</span>
      </div>

      <!-- Results Table -->
      <div class="chart-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/[0.02]">
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Student</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Quiz / Module</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Risk</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Category</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Flags</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Status</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Date</th>
                <th class="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="result in results" :key="result.id" class="hover:bg-purple-50/50 dark:hover:bg-white/[0.02] transition-all">
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div :class="['w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-md',
                      result.flags_detected ? 'bg-gradient-to-tr from-red-500 to-orange-500' : 'bg-gradient-to-tr from-purple-600 to-fuchsia-600']">
                      {{ getInitials(result.student?.name) }}
                    </div>
                    <div>
                      <span class="font-bold text-sm text-black dark:text-white block">{{ result.student?.name || 'Unknown' }}</span>
                      <span class="text-[10px] text-black/40 dark:text-slate-500">{{ result.student?.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="text-xs font-bold text-black/70 dark:text-slate-300 block">{{ result.quiz?.title || '—' }}</span>
                  <span class="text-[10px] text-black/40 dark:text-slate-500">{{ result.quiz?.module?.title || '' }}</span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase', riskBadgeClass(result.overall_risk_level)]">
                    {{ result.overall_risk_level }}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4 text-xs font-bold text-black/60 dark:text-slate-400">{{ result.dominant_category }}</td>
                <td class="px-4 md:px-6 py-4">
                  <span v-if="result.flags_detected" class="text-red-500 font-black text-xs">{{ result.concerning_answers_count }} ⚠</span>
                  <span v-else class="text-emerald-500 font-bold text-xs">None</span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span v-if="result.reviewed" class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Reviewed</span>
                  <span v-else class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">Pending</span>
                </td>
                <td class="px-4 md:px-6 py-4 text-[10px] font-bold text-black/40 dark:text-slate-500">{{ formatDate(result.created_at) }}</td>
                <td class="px-4 md:px-6 py-4">
                  <button @click="openDetail(result.id)" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-colors">
                    View
                  </button>
                </td>
              </tr>
              <tr v-if="results.length === 0">
                <td colspan="8" class="px-8 py-14 text-center text-xs text-black/30 dark:text-slate-600 font-bold uppercase tracking-widest italic">No analysis results found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="resultsTotalPages > 1" class="flex items-center justify-center gap-2 p-6 border-t border-slate-100 dark:border-white/5">
          <button @click="fetchResults(resultsPage - 1)" :disabled="resultsPage <= 1"
            class="px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Prev
          </button>
          <span class="text-xs font-bold text-black/60 dark:text-slate-400">Page {{ resultsPage }} of {{ resultsTotalPages }}</span>
          <button @click="fetchResults(resultsPage + 1)" :disabled="resultsPage >= resultsTotalPages"
            class="px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== DETAIL MODAL ==================== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="detailResult" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="detailResult = null"></div>
          <div class="relative bg-white dark:bg-[#12101c] border border-slate-200 dark:border-white/10 rounded-[2rem] md:rounded-[3rem] max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <!-- Detail Header -->
            <div class="sticky top-0 z-10 bg-white/95 dark:bg-[#12101c]/95 backdrop-blur-xl p-6 md:p-8 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-tight">Analysis Detail</h3>
                  <p class="text-[10px] font-bold text-black/40 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {{ detailResult.student?.name }} — {{ detailResult.quiz?.title }}
                  </p>
                </div>
                <button @click="detailResult = null" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  <XIcon class="w-5 h-5 text-black/60 dark:text-slate-400" />
                </button>
              </div>

              <!-- Risk Badge -->
              <div class="flex flex-wrap gap-3 mt-4">
                <span :class="['px-4 py-2 rounded-full text-[10px] font-black uppercase', riskBadgeClass(detailResult.overall_risk_level)]">
                  Risk: {{ detailResult.overall_risk_level }}
                </span>
                <span class="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  {{ detailResult.dominant_category }}
                </span>
                <span class="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-white/5 text-black/60 dark:text-slate-400">
                  {{ detailResult.total_answers_analyzed }} answers analyzed
                </span>
                <span v-if="detailResult.flags_detected" class="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                  {{ detailResult.concerning_answers_count }} concerning answers
                </span>
              </div>
            </div>

            <!-- Per-Answer Analysis -->
            <div class="p-6 md:p-8 space-y-4">
              <h4 class="text-xs font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 mb-4">Per-Answer Breakdown</h4>
              <div v-for="(item, index) in detailResult.analysis_results" :key="index"
                :class="['p-4 md:p-5 rounded-2xl border transition-all', 
                  item.risk_level === 'Severe' ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' :
                  item.risk_level === 'High' ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20' :
                  item.risk_level === 'Moderate' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' :
                  'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5']">
                <div class="flex items-start gap-3 mb-3">
                  <span class="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-[10px] font-black text-purple-600 dark:text-purple-400 flex-shrink-0">{{ index + 1 }}</span>
                  <p class="text-sm font-medium text-black/80 dark:text-slate-300 italic">"{{ item.answer_text }}"</p>
                </div>
                <div class="flex flex-wrap gap-2 ml-10">
                  <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase', riskBadgeClass(item.risk_level)]">{{ item.risk_level }}</span>
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 dark:bg-white/5 text-black/60 dark:text-slate-400">{{ item.category }}</span>
                  <span class="px-3 py-1 rounded-full text-[9px] font-bold bg-slate-50 dark:bg-white/[0.02] text-black/40 dark:text-slate-500">{{ item.detection_method }}</span>
                </div>
                <div v-if="item.behaviors && item.behaviors.length" class="ml-10 mt-2">
                  <span class="text-[9px] font-bold text-black/30 dark:text-slate-600 uppercase">Behaviors: </span>
                  <span class="text-[10px] text-black/50 dark:text-slate-500">{{ item.behaviors.join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Review Section -->
            <div class="p-6 md:p-8 border-t border-slate-100 dark:border-white/5">
              <div v-if="detailResult.reviewed" class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10">
                <div class="flex items-center gap-2 mb-2">
                  <ShieldCheckIcon class="w-4 h-4 text-emerald-600" />
                  <span class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">Reviewed</span>
                  <span class="text-[10px] text-emerald-600/60 dark:text-emerald-500/60">by {{ detailResult.reviewer?.name || 'Unknown' }} — {{ formatDate(detailResult.reviewed_at) }}</span>
                </div>
                <p v-if="detailResult.facilitator_notes" class="text-sm text-emerald-700 dark:text-emerald-300 mt-1">{{ detailResult.facilitator_notes }}</p>
              </div>
              <div v-else class="space-y-4">
                <textarea v-model="reviewNotes" rows="3" placeholder="Add facilitator notes (optional)..."
                  class="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-4 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"></textarea>
                <button @click="markReviewed(detailResult.id)" :disabled="reviewLoading"
                  class="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-100 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50">
                  {{ reviewLoading ? 'Saving...' : 'Mark as Reviewed' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/utils/api';
import {
  BarChart3 as BarChart3Icon, List as ListIcon, Brain as BrainIcon,
  Flag as FlagIcon, Clock as ClockIcon, ShieldCheck as ShieldCheckIcon,
  AlertTriangle as AlertTriangleIcon, X as XIcon
} from 'lucide-vue-next';

const loading = ref(true);
const error = ref(null);
const activeTab = ref('overview');

// Overview state
const stats = ref({
  totalAnalyses: 0,
  flaggedCount: 0,
  unreviewedCount: 0,
  riskDistribution: {},
  categoryDistribution: {},
  recentFlags: []
});

// Results state
const results = ref([]);
const resultsPage = ref(1);
const resultsTotal = ref(0);
const resultsTotalPages = ref(0);
const filterRisk = ref('');
const filterFlagged = ref(false);
const filterUnreviewed = ref(false);

// Detail state
const detailResult = ref(null);
const reviewNotes = ref('');
const reviewLoading = ref(false);

const reviewedCount = computed(() => stats.value.totalAnalyses - stats.value.unreviewedCount);

const riskDistributionSorted = computed(() => {
  const order = ['Severe', 'High', 'Moderate', 'Low'];
  const sorted = {};
  order.forEach(level => {
    if (stats.value.riskDistribution?.[level]) {
      sorted[level] = stats.value.riskDistribution[level];
    }
  });
  return sorted;
});

// Helpers
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const riskColor = (level) => ({
  'Severe': 'text-red-600 dark:text-red-400',
  'High': 'text-orange-600 dark:text-orange-400',
  'Moderate': 'text-amber-600 dark:text-amber-400',
  'Low': 'text-emerald-600 dark:text-emerald-400'
}[level] || 'text-slate-500');

const riskBarColor = (level) => ({
  'Severe': 'bg-gradient-to-r from-red-500 to-red-600',
  'High': 'bg-gradient-to-r from-orange-500 to-orange-600',
  'Moderate': 'bg-gradient-to-r from-amber-500 to-amber-600',
  'Low': 'bg-gradient-to-r from-emerald-500 to-emerald-600'
}[level] || 'bg-slate-300');

const riskBadgeClass = (level) => ({
  'Severe': 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  'High': 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Moderate': 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Low': 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
}[level] || 'bg-slate-100 dark:bg-white/5 text-slate-500');

const categoryDotColor = (category) => {
  if (category.includes('Physical')) return 'bg-red-500';
  if (category.includes('Control')) return 'bg-orange-500';
  if (category.includes('Verbal')) return 'bg-amber-500';
  if (category.includes('Neglect')) return 'bg-yellow-500';
  if (category.includes('Support') || category.includes('Healthy') || category.includes('Trust')) return 'bg-emerald-500';
  return 'bg-slate-400';
};

const riskPercent = (count) => {
  const max = Math.max(...Object.values(stats.value.riskDistribution || { _: 1 }));
  return max > 0 ? (count / max) * 100 : 0;
};

const tabClass = (tab) => [
  'flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
  activeTab.value === tab
    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
    : 'bg-white dark:bg-white/5 text-black/60 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-purple-500/30'
].join(' ');

// Data fetching
const fetchStats = async () => {
  try {
    const { data } = await api.get('/api/v1/ml-analysis/facilitator/stats');
    if (data.success) {
      stats.value = data.stats;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics';
  }
};

const fetchResults = async (page = 1) => {
  try {
    const params = new URLSearchParams({ page, limit: 20 });
    if (filterRisk.value) params.append('riskLevel', filterRisk.value);
    if (filterFlagged.value) params.append('flaggedOnly', 'true');
    if (filterUnreviewed.value) params.append('reviewed', 'false');

    const { data } = await api.get(`/api/v1/ml-analysis/facilitator/results?${params}`);
    if (data.success) {
      results.value = data.results;
      resultsPage.value = data.page;
      resultsTotal.value = data.total;
      resultsTotalPages.value = data.totalPages;
    }
  } catch (err) {
    console.error('Failed to load results:', err);
  }
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    await Promise.all([fetchStats(), fetchResults()]);
  } finally {
    loading.value = false;
  }
};

const openDetail = async (id) => {
  try {
    const { data } = await api.get(`/api/v1/ml-analysis/${id}`);
    if (data.success) {
      detailResult.value = data.result;
      reviewNotes.value = '';
    }
  } catch (err) {
    console.error('Failed to load detail:', err);
  }
};

const markReviewed = async (id) => {
  reviewLoading.value = true;
  try {
    const { data } = await api.patch(`/api/v1/ml-analysis/${id}/review`, {
      notes: reviewNotes.value || null
    });
    if (data.success) {
      // Update the detail view
      detailResult.value.reviewed = true;
      detailResult.value.reviewed_at = new Date().toISOString();
      detailResult.value.facilitator_notes = reviewNotes.value;
      // Refresh stats
      await fetchStats();
      await fetchResults(resultsPage.value);
    }
  } catch (err) {
    console.error('Failed to mark reviewed:', err);
  } finally {
    reviewLoading.value = false;
  }
};

// Watch tab changes
watch(activeTab, (tab) => {
  if (tab === 'results' && results.value.length === 0) fetchResults();
});

onMounted(fetchData);
</script>

<style scoped>
@reference "../../style.css";

@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');
.custom-font-poppins { font-family: 'Poppins', sans-serif !important; }

.stat-card {
  @apply backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl transition-all hover:border-purple-500/20 flex flex-col items-start;
}

.chart-card {
  @apply bg-white/80 dark:bg-[#0d0d12]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:border-purple-500/20;
}

.filter-select {
  @apply px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-black/60 dark:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { @apply bg-purple-600/20 rounded-full; }
</style>
