<template>
  <section id="modes"
    class="landing-section bg-white dark:bg-abyss-900 py-20 px-6 border-y-2 border-slate-200 dark:border-abyss-700">
    <div class="max-w-6xl mx-auto">

      <div class="text-center mb-14">
        <p class="font-mplusrounded text-xs font-bold uppercase tracking-[0.2em] text-calm-lavender-500 mb-3">Game Modes
        </p>
        <h2 class="font-madimione text-3xl md:text-5xl text-slate-900 dark:text-white tracking-tight">
          Choose Your Challenge
        </h2>
        <p class="font-averta text-base text-slate-500 dark:text-platinum-400 mt-4 max-w-lg mx-auto leading-relaxed">
          Three ways to test your WGAD and VAWC knowledge — pick your fight and level up your advocacy.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- ══════════════════════════════════════════════ -->
        <!-- TIME ATTACK (quiz_type: time_attack)           -->
        <!-- ══════════════════════════════════════════════ -->
        <div @click="handlePlayGame('time-attack')"
          class="group bg-white dark:bg-abyss-800 border-2 border-neon-pink-200 dark:border-neon-pink-800/50 border-b-[6px] rounded-3xl overflow-hidden hover:-translate-y-1.5 active:border-b-[2px] active:translate-y-[4px] transition-all duration-200 cursor-pointer flex flex-col">
          <!-- Demo preview — mirrors the ring timer + answer grid in QuizPlayer -->
          <div class="relative bg-neon-pink-500 px-4 pt-4 pb-0 overflow-hidden">
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-neon-pink-400 rounded-full opacity-40"></div>
            <div class="absolute -bottom-6 -left-6 w-20 h-20 bg-neon-pink-700 rounded-full opacity-30"></div>

            <!-- Header row: question number + ring timer (exact QuizPlayer SVG ring) -->
            <div class="relative z-10 flex items-center gap-2 mb-3">
              <div
                class="w-7 h-7 rounded-lg bg-white/25 border border-white/30 flex items-center justify-center font-madimione text-white text-xs">
                1</div>
              <span class="font-averta text-white/75 text-[11px]">Time Attack</span>
              <!-- SVG ring timer — identical to QuizPlayer's ring -->
              <div class="ml-auto flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-lg px-2 py-1">
                <div class="relative w-6 h-6 shrink-0">
                  <svg class="w-full h-full" style="transform: rotate(-90deg)">
                    <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none" stroke="rgba(255,255,255,0.2)" />
                    <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none" stroke="white" stroke-linecap="round"
                      stroke-dasharray="100" stroke-dashoffset="35" />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-1 h-1 rounded-full bg-white/70"></div>
                  </div>
                </div>
                <span class="font-madimione text-white text-sm leading-none">23s</span>
              </div>
            </div>

            <!-- Question card -->
            <div class="relative z-10 bg-white/15 border border-white/25 rounded-xl p-3 mb-2.5">
              <p class="font-averta text-white text-[11px] font-semibold leading-snug">
                What law penalizes Violence Against Women and their Children in the Philippines?
              </p>
            </div>

            <!-- 2×2 answer grid — letter buttons match QuizPlayer exactly -->
            <div class="relative z-10 grid grid-cols-2 gap-1.5 pb-4">
              <div class="bg-white/20 rounded-xl p-2 flex items-center gap-1.5 border border-white/20">
                <div
                  class="w-5 h-5 rounded-md bg-white/30 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  A</div>
                <span class="font-averta text-white text-[10px] font-medium leading-tight">RA 7877</span>
              </div>
              <div class="bg-white/20 rounded-xl p-2 flex items-center gap-1.5 border border-white/20">
                <div
                  class="w-5 h-5 rounded-md bg-white/30 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  B</div>
                <span class="font-averta text-white text-[10px] font-medium leading-tight">RA 8353</span>
              </div>
              <!-- Correct answer highlighted (teal, matching QuizPlayer correct state) -->
              <div class="bg-safety-teal-400 rounded-xl p-2 flex items-center gap-1.5 border-2 border-white/60">
                <div
                  class="w-5 h-5 rounded-md bg-white/40 flex items-center justify-center font-madimione text-safety-teal-800 text-[10px] shrink-0">
                  C</div>
                <span class="font-averta text-white text-[10px] font-bold leading-tight inline-flex items-center gap-1">
                  RA 9262
                  <i class="fa-solid fa-check"></i>
                </span>
              </div>
              <div class="bg-white/10 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-50">
                <div
                  class="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  D</div>
                <span class="font-averta text-white text-[10px] font-medium leading-tight">RA 9710</span>
              </div>
            </div>
          </div>

          <div class="p-5 flex flex-col gap-2 flex-1">
            <span
              class="bg-neon-pink-500 text-white font-mplusrounded text-xs font-bold uppercase px-3 py-1 rounded-lg w-fit border-b-2 border-neon-pink-700 inline-flex items-center gap-2">
              <i class="fa-solid fa-stopwatch"></i>
              Race the Clock</span>
            <h3 class="font-madimione text-2xl text-neon-pink-600 dark:text-neon-pink-400">Time Attack</h3>
            <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">
              Answer each question before the timer hits zero. Every second counts.
            </p>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════ -->
        <!-- BOSS BATTLE (quiz_type: boss_battle)           -->
        <!-- ══════════════════════════════════════════════ -->
        <div @click="handlePlayGame('boss-battle')"
          class="group bg-white dark:bg-abyss-800 border-2 border-vawc-orange-200 dark:border-vawc-orange-800/50 border-b-[6px] rounded-3xl overflow-hidden hover:-translate-y-1.5 active:border-b-[2px] active:translate-y-[4px] transition-all duration-200 cursor-pointer flex flex-col">
          <!-- Demo preview — mirrors the boss HP bar + skull in QuizPlayer -->
          <div class="relative bg-gradient-to-b from-red-600 to-vawc-orange-500 px-4 pt-4 pb-0 overflow-hidden">
            <div class="absolute -top-8 -right-8 w-28 h-28 bg-red-400 rounded-full opacity-30"></div>
            <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-vawc-orange-700 rounded-full opacity-30"></div>

            <!-- Mode badge row -->
            <div class="relative z-10 flex items-center gap-2 mb-3">
              <!-- Skull (QuizPlayer uses SkullIcon from lucide) -->
              <div class="bg-white/20 border border-white/30 rounded-lg p-1.5 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a2 2 0 002 2h4a2 2 0 002-2v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
                  <line x1="9" y1="12" x2="9.01" y2="12" stroke-linecap="round" stroke-width="2.5" />
                  <line x1="15" y1="12" x2="15.01" y2="12" stroke-linecap="round" stroke-width="2.5" />
                </svg>
                <span class="font-averta text-white text-[11px] font-semibold">Boss Battle</span>
              </div>
              <!-- Damage popup (the -X% that flies in QuizPlayer) -->
              <span class="ml-auto font-madimione text-amber-300 text-sm font-bold">-10%</span>
            </div>

            <!-- Boss HP bar — exact match of QuizPlayer's boss HP section -->
            <div class="relative z-10 bg-red-900/40 border border-red-300/25 rounded-xl p-3 mb-2.5">
              <div class="flex items-center justify-between mb-2">
                <span class="font-averta text-red-200 text-[11px] font-semibold">Boss HP</span>
                <span class="font-madimione text-red-200 text-sm">34%</span>
              </div>
              <div class="h-3 rounded-full overflow-hidden bg-red-900/60">
                <div class="h-full bg-gradient-to-r from-red-500 to-vawc-orange-400 rounded-full" style="width:34%">
                </div>
              </div>
            </div>

            <!-- Question card -->
            <div class="relative z-10 bg-white/15 border border-white/20 rounded-xl p-3 mb-2.5">
              <p class="font-averta text-white text-[11px] font-semibold leading-snug">
                Under WGAD, what concept ensures women and men start from the same ground?
              </p>
            </div>

            <!-- 2×2 answers -->
            <div class="relative z-10 grid grid-cols-2 gap-1.5 pb-4">
              <div class="bg-white/15 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  A</div>
                <span class="font-averta text-white text-[10px]">Equity</span>
              </div>
              <div class="bg-safety-teal-400 rounded-xl p-2 flex items-center gap-1.5 border-2 border-white/60">
                <div
                  class="w-5 h-5 rounded-md bg-white/40 flex items-center justify-center font-madimione text-safety-teal-800 text-[10px] shrink-0">
                  B</div>
                <span class="font-averta text-white text-[10px] font-bold inline-flex items-center gap-1">
                  Equality
                  <i class="fa-solid fa-check"></i>
                </span>
              </div>
              <div class="bg-white/15 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  C</div>
                <span class="font-averta text-white text-[10px]">Empathy</span>
              </div>
              <div class="bg-white/15 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  D</div>
                <span class="font-averta text-white text-[10px]">Privilege</span>
              </div>
            </div>
          </div>

          <div class="p-5 flex flex-col gap-2 flex-1">
            <span
              class="bg-vawc-orange-500 text-white font-mplusrounded text-xs font-bold uppercase px-3 py-1 rounded-lg w-fit border-b-2 border-vawc-orange-700 inline-flex items-center gap-2">
              <i class="fa-solid fa-skull"></i>
              High Stakes</span>
            <h3 class="font-madimione text-2xl text-vawc-orange-600 dark:text-vawc-orange-400">Boss Battle</h3>
            <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">
              Drain the Shadow Warden's HP to zero by answering correctly. One miss and the boss fights back.
            </p>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════ -->
        <!-- STREAK (quiz_type: streak)                     -->
        <!-- ══════════════════════════════════════════════ -->
        <div @click="handlePlayGame('streak')"
          class="group bg-white dark:bg-abyss-800 border-2 border-safety-teal-200 dark:border-safety-teal-800/50 border-b-[6px] rounded-3xl overflow-hidden hover:-translate-y-1.5 active:border-b-[2px] active:translate-y-[4px] transition-all duration-200 cursor-pointer flex flex-col">
          <!-- Demo preview — mirrors streak + combo UI in QuizPlayer -->
          <div class="relative bg-gradient-to-b from-safety-teal-600 to-safety-teal-500 px-4 pt-4 pb-0 overflow-hidden">
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-safety-teal-400 rounded-full opacity-40"></div>
            <div class="absolute bottom-0 -left-4 w-20 h-20 bg-safety-teal-800 rounded-full opacity-30"></div>

            <!-- Header stat row (matches QuizPlayer's stat badges exactly) -->
            <div class="relative z-10 flex items-center gap-2 mb-3">
              <!-- Flame + streak count (QuizPlayer: FlameIcon + x{{ streakCount }}) -->
              <div
                class="flex items-center gap-1.5 bg-vawc-orange-400/40 border border-vawc-orange-300/40 rounded-lg px-2.5 py-1">
                <svg class="w-4 h-4 text-vawc-orange-300" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C9.5 5.5 9 8 10 11c-2-1.5-2.5-4-2-7C5.5 7 4 11 4 14a8 8 0 0016 0c0-4.5-3.5-8.5-4-10-1 3-2 4.5-4 6 1-2.5 0-5 0-8z" />
                </svg>
                <span class="font-madimione text-white text-base leading-none">x5</span>
              </div>
              <!-- Score (QuizPlayer: SparklesIcon + score) -->
              <div class="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-lg px-2.5 py-1">
                <svg class="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span class="font-madimione text-white text-sm leading-none">2,375</span>
              </div>
              <!-- Combo badge (QuizPlayer shows this when comboCount >= 2) -->
              <div class="ml-auto bg-amber-400/25 border border-amber-300/40 rounded-lg px-2 py-1">
                <span class="font-averta text-amber-200 text-[11px] font-bold">5x Combo!</span>
              </div>
            </div>

            <!-- Question card -->
            <div class="relative z-10 bg-white/15 border border-white/20 rounded-xl p-3 mb-2.5">
              <p class="font-averta text-white text-[11px] font-semibold leading-snug">
                Under RA 9710 (Magna Carta of Women), who must establish a WGAD Focal Point System?
              </p>
            </div>

            <!-- 2×2 answers (post-answer reveal state) -->
            <div class="relative z-10 grid grid-cols-2 gap-1.5 pb-4">
              <div class="bg-white/10 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  A</div>
                <span class="font-averta text-white text-[10px]">LGUs only</span>
              </div>
              <div class="bg-white/10 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  B</div>
                <span class="font-averta text-white text-[10px]">Schools</span>
              </div>
              <div class="bg-safety-teal-400 rounded-xl p-2 flex items-center gap-1.5 border-2 border-white/60">
                <div
                  class="w-5 h-5 rounded-md bg-white/40 flex items-center justify-center font-madimione text-safety-teal-800 text-[10px] shrink-0">
                  C</div>
                <span class="font-averta text-white text-[10px] font-bold inline-flex items-center gap-1">
                  All agencies
                  <i class="fa-solid fa-check"></i>
                </span>
              </div>
              <div class="bg-white/10 rounded-xl p-2 flex items-center gap-1.5 border border-white/15 opacity-40">
                <div
                  class="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-madimione text-white text-[10px] shrink-0">
                  D</div>
                <span class="font-averta text-white text-[10px]">NGOs only</span>
              </div>
            </div>
          </div>

          <div class="p-5 flex flex-col gap-2 flex-1">
            <span
              class="bg-safety-teal-500 text-white font-mplusrounded text-xs font-bold uppercase px-3 py-1 rounded-lg w-fit border-b-2 border-safety-teal-700 inline-flex items-center gap-2">
              <i class="fa-solid fa-fire"></i>
              Streak Multiplier</span>
            <h3 class="font-madimione text-2xl text-safety-teal-600 dark:text-safety-teal-400">Streak</h3>
            <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">
              Keep your answer streak alive — every consecutive correct answer boosts your score multiplier.
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handlePlayGame = (gameModeId) => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'quiz.player', params: { id: gameModeId } });
  } else {
    router.push({ name: 'login', query: { redirect: `/quiz/play/${gameModeId}` } });
  }
};
</script>