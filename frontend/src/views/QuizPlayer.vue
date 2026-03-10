<template>
  <div :class="['quiz-arena min-h-screen font-[Poppins,sans-serif] overflow-hidden relative transition-colors duration-500 selection:bg-purple-500/30',
    isDark ? 'bg-[#0a0014]' : 'bg-gradient-to-br from-purple-50 via-white to-violet-50']">
    
    <!-- ==================== 3D BACKGROUND ==================== -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden" style="perspective: 1000px;">
      <!-- 3D Grid Floor -->
      <div :class="['absolute bottom-0 left-1/2 w-[200vw] h-[60vh]',
        isDark ? 'opacity-30' : 'opacity-20']"
        style="transform: translateX(-50%) rotateX(70deg); transform-origin: bottom; background: linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px) 0 0 / 60px 60px, linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px) 0 0 / 60px 60px;">
      </div>
      
      <!-- Floating 3D Cubes -->
      <div v-for="i in 8" :key="'cube-'+i" 
        class="absolute cube-3d"
        :style="getCubeStyle(i)">
        <div :class="['cube-face cube-front', isDark ? 'bg-purple-600/40' : 'bg-purple-400/30']"></div>
        <div :class="['cube-face cube-back', isDark ? 'bg-purple-700/40' : 'bg-purple-500/30']"></div>
        <div :class="['cube-face cube-left', isDark ? 'bg-purple-800/40' : 'bg-purple-600/30']"></div>
        <div :class="['cube-face cube-right', isDark ? 'bg-purple-500/40' : 'bg-purple-300/30']"></div>
        <div :class="['cube-face cube-top', isDark ? 'bg-purple-400/50' : 'bg-purple-200/40']"></div>
        <div :class="['cube-face cube-bottom', isDark ? 'bg-purple-900/40' : 'bg-purple-700/30']"></div>
      </div>
      
      <!-- Glowing Orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-purple-600/20 blur-[100px] animate-pulse-slow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-72 md:h-72 rounded-full bg-violet-500/20 blur-[80px] animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-breathe" style="transform: translate(-50%, -50%);"></div>
      
      <!-- Moving particles -->
      <div v-for="i in 20" :key="'particle-'+i" 
        :class="['absolute rounded-full animate-float-up', isDark ? 'bg-purple-400/60' : 'bg-purple-500/40']"
        :style="getParticleStyle(i)"></div>
    </div>

    <!-- ==================== THEME TOGGLE (ALWAYS VISIBLE) ==================== -->
    <button @click="toggleTheme" 
      :class="['fixed top-4 right-4 z-[100] p-3 md:p-4 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 group',
        isDark ? 'bg-purple-900/50 border-purple-500/50 hover:bg-purple-800/60' : 'bg-white/80 border-purple-200 hover:bg-purple-50']">
      <div class="relative w-6 h-6 md:w-7 md:h-7">
        <SunIcon v-if="isDark" class="w-full h-full text-amber-400 group-hover:rotate-45 transition-transform" />
        <MoonIcon v-else class="w-full h-full text-purple-600 group-hover:-rotate-12 transition-transform" />
      </div>
      <div :class="['absolute -bottom-8 left-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap',
        isDark ? 'text-purple-300' : 'text-purple-600']" style="transform: translateX(-50%);">
        {{ isDark ? 'Light Mode' : 'Dark Mode' }}
      </div>
    </button>

    <!-- ==================== SCREEN EFFECTS ==================== -->
    <Transition name="flash">
      <div v-if="screenFlash" :class="['fixed inset-0 z-50 pointer-events-none',
        screenFlash === 'correct' ? 'bg-violet-400/30' : 'bg-rose-500/40']"></div>
    </Transition>
    
    <!-- Score Popups -->
    <TransitionGroup name="score-pop">
      <div v-for="popup in scorePopups" :key="popup.id"
        class="fixed z-50 pointer-events-none select-none"
        :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
        <div :class="['text-4xl md:text-5xl font-black drop-shadow-2xl', popup.type === 'correct' ? 'text-violet-400' : 'text-rose-400']">
          {{ popup.text }}
        </div>
        <div v-if="popup.combo" class="text-xl md:text-2xl font-black text-amber-400 animate-bounce">
          {{ popup.combo }}x COMBO!
        </div>
      </div>
    </TransitionGroup>

    <!-- ==================== LOADING STATE ==================== -->
    <div v-if="loading" class="relative z-10 min-h-screen flex flex-col items-center justify-center gap-6 md:gap-8 px-4">
      <div class="relative" style="perspective: 800px;">
        <!-- 3D Spinning Loader -->
        <div class="w-28 h-28 md:w-40 md:h-40 relative animate-spin-slow" style="transform-style: preserve-3d;">
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-2xl"
            style="transform: translateZ(30px); box-shadow: 0 0 40px rgba(147, 51, 234, 0.5);"></div>
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700"
            style="transform: translateZ(-30px);"></div>
          <div class="absolute inset-0 flex items-center justify-center" style="transform: translateZ(40px);">
            <ZapIcon class="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <h2 :class="['text-2xl md:text-4xl font-black uppercase italic tracking-tight animate-pulse',
          isDark ? 'text-white' : 'text-purple-900']">
          Loading <span class="text-purple-500">Arena</span>
        </h2>
        <div class="flex items-center justify-center gap-2 mt-4">
          <div class="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style="animation-delay: 0s"></div>
          <div class="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>

    <!-- ==================== MAIN QUIZ INTERFACE ==================== -->
    <div v-else-if="quiz && currentQuestion && !isFinished" 
      :class="['relative z-10 min-h-screen flex flex-col', { 'animate-shake': isShaking }]">
      
      <!-- Review Mode Banner -->
      <div v-if="isReviewMode" :class="['relative overflow-hidden border-b',
        isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200']">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-shimmer"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-2 md:py-3 flex items-center justify-center gap-2 md:gap-3">
          <BookOpenIcon class="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          <p class="text-xs md:text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Practice Mode — No XP
          </p>
        </div>
      </div>

      <!-- ========== 3D GAME HEADER ========== -->
      <header :class="['sticky top-0 z-40 backdrop-blur-2xl border-b',
        isDark ? 'bg-[#0a0014]/90 border-purple-500/20' : 'bg-white/90 border-purple-200']">
        <div class="max-w-6xl mx-auto px-3 md:px-6 py-3 md:py-4">
          <div class="flex items-center justify-between gap-3">
            <!-- Exit Button (3D Style) -->
            <button @click="triggerBack" 
              :class="['group relative p-2.5 md:p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0',
                isDark ? 'bg-purple-900/50 border-purple-500/50 hover:bg-red-900/50 hover:border-red-500/50' : 
                'bg-purple-50 border-purple-200 hover:bg-red-50 hover:border-red-300']"
              style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
              <XIcon :class="['w-5 h-5 md:w-6 md:h-6 transition-colors', isDark ? 'text-purple-300 group-hover:text-red-400' : 'text-purple-600 group-hover:text-red-500']" />
            </button>

            <!-- Mode Indicator (3D Card) -->
            <div :class="['relative px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 transition-all',
              isDark ? 'bg-purple-900/50 border-purple-500/50' : 'bg-purple-50 border-purple-200']"
              style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
              <div class="flex items-center gap-2 md:gap-3">
                <component :is="modeIcon" :class="['w-5 h-5 md:w-6 md:h-6', modeIconColor]" />
                <span :class="['text-sm md:text-base font-black uppercase tracking-wider', isDark ? 'text-purple-300' : 'text-purple-700']">
                  {{ modeLabel }}
                </span>
              </div>
            </div>

            <!-- Timer / Streak / Boss HP -->
            <div class="flex items-center gap-2 md:gap-4">
              <!-- Timer (Time Attack) -->
              <div v-if="quiz.quiz_type === 'time_attack'" 
                :class="['relative flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 transition-all',
                  timeLeft <= 10 ? 'bg-red-500/20 border-red-500' : (isDark ? 'bg-purple-900/50 border-purple-500/50' : 'bg-purple-50 border-purple-200')]"
                style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
                <div class="relative w-8 h-8 md:w-10 md:h-10">
                  <svg class="w-full h-full" style="transform: rotate(-90deg);">
                    <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none" 
                      :class="isDark ? 'stroke-purple-900' : 'stroke-purple-100'" />
                    <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none" 
                      :class="timeLeft <= 10 ? 'stroke-red-500' : 'stroke-purple-500'"
                      stroke-linecap="round"
                      :stroke-dasharray="100"
                      :stroke-dashoffset="100 - (100 * (timeLeft / (quiz.time_limit || 30)))"
                      class="transition-all duration-1000" />
                  </svg>
                  <ClockIcon :class="['absolute top-1/2 left-1/2 w-4 h-4 md:w-5 md:h-5',
                    timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-500']" style="transform: translate(-50%, -50%);" />
                </div>
                <span :class="['text-xl md:text-2xl font-black tabular-nums', timeLeft <= 10 ? 'text-red-500' : (isDark ? 'text-white' : 'text-purple-900')]">
                  {{ timeLeft }}s
                </span>
              </div>

              <!-- Streak Counter -->
              <div v-if="quiz.quiz_type === 'streak'" 
                :class="['relative flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 transition-all',
                  streakCount >= 3 ? 'bg-orange-500/20 border-orange-500' : (isDark ? 'bg-purple-900/50 border-purple-500/50' : 'bg-purple-50 border-purple-200')]"
                style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
                <FlameIcon :class="['w-6 h-6 md:w-8 md:h-8', streakCount >= 3 ? 'text-orange-400 animate-bounce' : 'text-purple-500']" />
                <span :class="['text-xl md:text-2xl font-black', streakCount >= 3 ? 'text-orange-400' : (isDark ? 'text-white' : 'text-purple-900')]">
                  x{{ streakCount }}
                </span>
              </div>

              <!-- Score -->
              <div :class="['relative flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2',
                isDark ? 'bg-purple-900/50 border-purple-500/50' : 'bg-purple-50 border-purple-200']"
                style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
                <SparklesIcon class="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                <span :class="['text-lg md:text-xl font-black', isDark ? 'text-white' : 'text-purple-900']">{{ score }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- ========== BOSS BATTLE HP BAR ========== -->
      <div v-if="quiz.quiz_type === 'boss_battle'" class="px-4 py-4 md:py-6">
        <div class="max-w-2xl mx-auto">
          <div :class="['relative p-3 md:p-4 rounded-2xl border-2 overflow-hidden',
            isDark ? 'bg-purple-900/30 border-red-500/50' : 'bg-red-50 border-red-200']"
            style="box-shadow: 0 6px 0 rgba(239, 68, 68, 0.3);">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <SkullIcon class="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                <span :class="['text-sm md:text-base font-black uppercase', isDark ? 'text-red-400' : 'text-red-600']">Boss</span>
              </div>
              <span :class="['text-lg md:text-xl font-black', isDark ? 'text-red-400' : 'text-red-600']">{{ Math.round(bossHP) }}%</span>
            </div>
            <div class="relative h-4 md:h-6 rounded-full overflow-hidden bg-red-950">
              <div class="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 transition-all duration-500"
                :style="{ width: bossHP + '%' }">
                <div class="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
              </div>
            </div>
            <!-- Boss Damage Indicator -->
            <Transition name="damage-pop">
              <div v-if="showBossDamage" class="absolute -top-6 right-4 text-2xl md:text-3xl font-black text-amber-400 animate-bounce">
                -{{ lastBossDamage }}%
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ========== MAIN GAME AREA ========== -->
      <main class="flex-1 flex flex-col items-center justify-center px-3 md:px-6 py-4 md:py-8">
        
        <!-- Progress Bar (3D Style) -->
        <div class="w-full max-w-4xl mb-6 md:mb-10">
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <span :class="['text-sm md:text-base font-bold', isDark ? 'text-purple-300' : 'text-purple-700']">
              Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions_data.length }}
            </span>
            <Transition name="combo-pop">
              <div v-if="comboCount >= 2" 
                :class="['px-3 py-1 rounded-full border-2', isDark ? 'bg-amber-500/20 border-amber-500/50' : 'bg-amber-50 border-amber-300']">
                <span class="text-sm md:text-base font-black text-amber-500">{{ comboCount }}x!</span>
              </div>
            </Transition>
          </div>
          <div :class="['relative h-3 md:h-4 rounded-full overflow-hidden', isDark ? 'bg-purple-950' : 'bg-purple-100']"
            style="box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
            <div class="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600 rounded-full transition-all duration-700"
              :style="{ width: ((currentQuestionIndex + 1) / quiz.questions_data.length) * 100 + '%' }">
              <div class="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <!-- Question Card (3D Effect) -->
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentQuestionIndex" class="w-full max-w-4xl">
            <!-- 3D Question Card -->
            <div :class="['relative rounded-2xl md:rounded-3xl border-2 overflow-hidden transition-all mb-5 md:mb-8',
              isDark ? 'bg-purple-900/40 border-purple-500/50' : 'bg-white border-purple-200',
              feedbackBorderClass]"
              style="box-shadow: 0 8px 0 rgba(147, 51, 234, 0.4), 0 16px 40px rgba(147, 51, 234, 0.2);">
              
              <!-- Top accent bar -->
              <div class="h-1.5 md:h-2 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600"></div>
              
              <div class="p-5 md:p-10">
                <!-- Question number badge -->
                <div class="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-lg md:text-2xl font-black shadow-lg"
                    style="box-shadow: 0 4px 0 rgba(109, 40, 217, 0.8);">
                    {{ currentQuestionIndex + 1 }}
                  </div>
                  <div>
                    <p :class="['text-xs md:text-sm font-black uppercase tracking-wider', isDark ? 'text-purple-400' : 'text-purple-500']">
                      {{ modeLabel }}
                    </p>
                    <p :class="['text-xs md:text-sm', isDark ? 'text-purple-300/60' : 'text-purple-400']">
                      Answer correctly to score!
                    </p>
                  </div>
                </div>
                
                <!-- Question Text -->
                <h2 :class="['text-xl md:text-3xl font-bold leading-relaxed', isDark ? 'text-white' : 'text-purple-900']">
                  {{ currentQuestion.question }}
                </h2>
              </div>
            </div>

            <!-- 3D Answer Options Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <button v-for="(option, index) in currentQuestion.options" :key="index"
                @click="handleAnswerSelection($event, index)"
                :disabled="selectedAnswer !== null"
                :class="['answer-btn group relative text-left transition-all duration-300 rounded-xl md:rounded-2xl border-2 overflow-hidden',
                  getOptionClass(index)]"
                :style="getOptionStyle(index)">
                
                <div class="p-4 md:p-6 flex items-center gap-3 md:gap-4">
                  <!-- Letter Badge -->
                  <div :class="['w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl font-black transition-all flex-shrink-0',
                    getOptionLetterClass(index)]"
                    style="box-shadow: 0 3px 0 rgba(0,0,0,0.2);">
                    {{ String.fromCharCode(65 + index) }}
                  </div>
                  
                  <!-- Option Text -->
                  <span :class="['font-semibold text-base md:text-lg flex-1', isDark ? 'text-white' : 'text-purple-900']">
                    {{ option }}
                  </span>
                  
                  <!-- Result Icons -->
                  <Transition name="icon-pop">
                    <div v-if="selectedAnswer !== null && index === currentQuestion.correctAnswer" 
                      class="w-10 h-10 md:w-12 md:h-12 bg-violet-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <CheckIcon class="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div v-else-if="selectedAnswer === index && index !== currentQuestion.correctAnswer"
                      class="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <XIcon class="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </Transition>
                </div>
                
                <!-- Hover glow effect -->
                <div v-if="selectedAnswer === null" 
                  class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </Transition>
      </main>
    </div>

    <!-- ==================== RESULTS SCREEN ==================== -->
    <div v-else-if="isFinished" class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <!-- Confetti -->
      <div v-if="scorePercentage >= 70" class="fixed inset-0 pointer-events-none overflow-hidden">
        <div v-for="i in 60" :key="'conf-'+i" 
          :class="['confetti absolute', confettiColors[i % confettiColors.length]]"
          :style="getConfettiStyle(i)"></div>
      </div>

      <!-- 3D Results Card -->
      <div class="max-w-xl w-full animate-in">
        <div :class="['relative rounded-3xl md:rounded-[3rem] overflow-hidden border-2',
          isDark ? 'bg-purple-900/50 border-purple-500/50' : 'bg-white border-purple-200']"
          style="box-shadow: 0 12px 0 rgba(147, 51, 234, 0.4), 0 24px 60px rgba(147, 51, 234, 0.3);">
          
          <!-- Trophy Section -->
          <div class="relative py-10 md:py-16">
            <div :class="['absolute inset-0 blur-[80px] opacity-50', resultGlowClass]"></div>
            <div :class="['relative w-28 h-28 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl', resultIconClass]"
              style="box-shadow: 0 8px 0 rgba(0,0,0,0.2);">
              <TrophyIcon v-if="scorePercentage >= 90" class="w-14 h-14 md:w-20 md:h-20" />
              <MedalIcon v-else-if="scorePercentage >= 70" class="w-14 h-14 md:w-20 md:h-20" />
              <StarIcon v-else-if="scorePercentage >= 50" class="w-14 h-14 md:w-20 md:h-20" />
              <TargetIcon v-else class="w-14 h-14 md:w-20 md:h-20" />
            </div>
          </div>

          <div class="p-6 md:p-10 pt-0 text-center">
            <h1 :class="['text-3xl md:text-5xl font-black uppercase italic tracking-tight mb-2',
              isDark ? 'text-white' : 'text-purple-900']">{{ resultTitle }}</h1>
            <p :class="['text-base md:text-lg mb-8 md:mb-10', isDark ? 'text-purple-300/70' : 'text-purple-500']">{{ resultSubtitle }}</p>

            <!-- XP Display -->
            <div :class="['rounded-2xl md:rounded-3xl p-6 md:p-8 mb-8 md:mb-10 border-2',
              isReviewMode ? (isDark ? 'bg-purple-900/30 border-purple-500/30' : 'bg-purple-50 border-purple-200') :
              'bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/50']"
              style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
              <p v-if="!isReviewMode" class="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
                +{{ score }}
              </p>
              <p v-else :class="['text-4xl md:text-5xl font-black', isDark ? 'text-purple-400' : 'text-purple-600']">{{ score }}</p>
              <p :class="['text-xs md:text-sm font-black uppercase tracking-widest mt-2',
                isReviewMode ? 'text-amber-500' : 'text-purple-500']">
                {{ isReviewMode ? 'Practice Score' : 'Experience Points' }}
              </p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-10">
              <div :class="['rounded-xl md:rounded-2xl p-3 md:p-5 border-2', isDark ? 'bg-violet-500/20 border-violet-500/30' : 'bg-violet-50 border-violet-200']"
                style="box-shadow: 0 3px 0 rgba(139, 92, 246, 0.3);">
                <p class="text-2xl md:text-3xl font-black text-violet-500">{{ correctAnswers }}</p>
                <p class="text-xs font-black uppercase text-violet-500/60">Correct</p>
              </div>
              <div :class="['rounded-xl md:rounded-2xl p-3 md:p-5 border-2', isDark ? 'bg-rose-500/20 border-rose-500/30' : 'bg-rose-50 border-rose-200']"
                style="box-shadow: 0 3px 0 rgba(244, 63, 94, 0.3);">
                <p class="text-2xl md:text-3xl font-black text-rose-500">{{ quiz.questions_data.length - correctAnswers }}</p>
                <p class="text-xs font-black uppercase text-rose-500/60">Wrong</p>
              </div>
              <div :class="['rounded-xl md:rounded-2xl p-3 md:p-5 border-2', isDark ? 'bg-fuchsia-500/20 border-fuchsia-500/30' : 'bg-fuchsia-50 border-fuchsia-200']"
                style="box-shadow: 0 3px 0 rgba(217, 70, 239, 0.3);">
                <p class="text-2xl md:text-3xl font-black text-fuchsia-500">{{ formatTime(totalTimeTaken) }}</p>
                <p class="text-xs font-black uppercase text-fuchsia-500/60">Time</p>
              </div>
            </div>

            <!-- Action Buttons (3D) -->
            <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button @click="router.push({ name: 'user.modules' })" 
                :class="['flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-wider border-2 transition-all hover:-translate-y-1 active:translate-y-0',
                isDark ? 'bg-purple-900/50 border-purple-500/50 text-purple-300 hover:bg-purple-800' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100']"
                style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
                <ArrowLeftIcon class="inline w-5 h-5 mr-2" /> Back
              </button>
              <button @click="router.push({ name: 'user.rewards-shop' })" 
                class="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-violet-600 border-2 border-purple-500 hover:-translate-y-1 active:translate-y-0 transition-all"
                style="box-shadow: 0 4px 0 rgba(109, 40, 217, 0.8);">
                <GiftIcon class="inline w-5 h-5 mr-2" /> Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== EXIT MODAL ==================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isBackModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-md" @click="resumeQuiz"></div>
          <div :class="['relative max-w-md w-full rounded-2xl md:rounded-[2rem] p-6 md:p-10 text-center border-2',
            isDark ? 'bg-purple-950 border-purple-500/50' : 'bg-white border-purple-200']"
            style="box-shadow: 0 8px 0 rgba(147, 51, 234, 0.4);">
            <AlertTriangleIcon class="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 text-amber-500" />
            <h3 :class="['text-2xl md:text-3xl font-black uppercase mb-2 md:mb-3', isDark ? 'text-white' : 'text-purple-900']">Exit Quiz?</h3>
            <p :class="['mb-8 md:mb-10', isDark ? 'text-purple-300/70' : 'text-purple-500']">Your progress will be lost.</p>
            <div class="flex gap-3 md:gap-4">
              <button @click="resumeQuiz" 
                :class="['flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase border-2 hover:-translate-y-1 active:translate-y-0 transition-all',
                isDark ? 'bg-purple-900/50 border-purple-500/50 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700']"
                style="box-shadow: 0 4px 0 rgba(147, 51, 234, 0.3);">
                Continue
              </button>
              <button @click="confirmExit" 
                class="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-white bg-red-500 border-2 border-red-400 hover:-translate-y-1 active:translate-y-0 transition-all"
                style="box-shadow: 0 4px 0 rgba(185, 28, 28, 0.8);">
                Exit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';
import { 
  Clock as ClockIcon, Trophy as TrophyIcon, Flame as FlameIcon, Skull as SkullIcon,
  Star as StarIcon, Target as TargetIcon, X as XIcon, Check as CheckIcon,
  AlertTriangle as AlertTriangleIcon, ArrowLeft as ArrowLeftIcon, BookOpen as BookOpenIcon,
  Gift as GiftIcon, Zap as ZapIcon, Sparkles as SparklesIcon, Medal as MedalIcon,
  Sun as SunIcon, Moon as MoonIcon
} from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Theme
const isDark = ref(true);
const checkTheme = () => { isDark.value = document.documentElement.classList.contains('dark'); };
const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

// State
const quiz = ref(null);
const loading = ref(true);
const isReviewMode = ref(false);
const currentQuestionIndex = ref(0);
const score = ref(0);
const correctAnswers = ref(0);
const timeLeft = ref(0);
const totalTimeTaken = ref(0);
const isFinished = ref(false);
const selectedAnswer = ref(null);
const isBackModalOpen = ref(false);
const streakCount = ref(0);
const comboCount = ref(0);
const bossHP = ref(100);
const isShaking = ref(false);
const screenFlash = ref(null);
const scorePopups = ref([]);
const showBossDamage = ref(false);
const lastBossDamage = ref(0);
const feedbackBorderClass = ref('');
const transitionName = ref('slide-right');
const userAnswers = ref([]); // Track user's selected answer texts for ML analysis
let timer = null;
let popupId = 0;
let themeObserver = null;

const confettiColors = ['bg-purple-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-purple-400', 'bg-violet-400'];

// Computed
const currentQuestion = computed(() => quiz.value?.questions_data?.[currentQuestionIndex.value] || null);
const scorePercentage = computed(() => quiz.value ? Math.round((correctAnswers.value / quiz.value.questions_data.length) * 100) : 0);

const modeIcon = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return SkullIcon;
  if (quiz.value?.quiz_type === 'streak') return FlameIcon;
  return ClockIcon;
});
const modeIconColor = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return 'text-red-500';
  if (quiz.value?.quiz_type === 'streak') return 'text-orange-500';
  return 'text-purple-500';
});
const modeLabel = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return 'Boss Battle';
  if (quiz.value?.quiz_type === 'streak') return 'Streak';
  return 'Time Attack';
});

const resultTitle = computed(() => {
  if (scorePercentage.value >= 90) return 'Legendary!';
  if (scorePercentage.value >= 70) return 'Excellent!';
  if (scorePercentage.value >= 50) return 'Good Job!';
  return 'Keep Going!';
});
const resultSubtitle = computed(() => {
  if (scorePercentage.value >= 90) return 'You dominated this challenge!';
  if (scorePercentage.value >= 70) return 'Outstanding performance!';
  if (scorePercentage.value >= 50) return 'You passed!';
  return 'Review and try again.';
});
const resultGlowClass = computed(() => scorePercentage.value >= 70 ? 'bg-amber-500' : 'bg-purple-500');
const resultIconClass = computed(() => {
  if (scorePercentage.value >= 70) return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white';
  if (scorePercentage.value >= 50) return 'bg-gradient-to-br from-purple-400 to-violet-500 text-white';
  return 'bg-purple-200 dark:bg-purple-900 text-purple-500';
});

// Methods
const getCubeStyle = (i) => ({
  width: `${30 + (i * 10) % 40}px`,
  height: `${30 + (i * 10) % 40}px`,
  top: `${(i * 12) % 80}%`,
  left: `${(i * 13) % 90}%`,
  animationDelay: `${i * 0.5}s`,
  animationDuration: `${10 + (i % 5) * 2}s`
});
const getParticleStyle = (i) => ({ 
  width: `${4 + (i % 4)}px`,
  height: `${4 + (i % 4)}px`,
  bottom: '-20px',
  left: `${(i * 5) % 100}%`, 
  animationDelay: `${i * 0.3}s`,
  animationDuration: `${4 + (i % 3)}s`
});
const getConfettiStyle = (i) => ({ 
  left: `${(i * 1.67) % 100}%`, 
  width: `${6 + (i % 4) * 2}px`, 
  height: `${6 + (i % 3) * 2}px`, 
  animationDelay: `${i * 0.05}s`, 
  animationDuration: `${2 + Math.random()}s` 
});
const formatTime = (s) => { const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

const startTimer = () => {
  if (timer) clearInterval(timer);
  timeLeft.value = quiz.value?.time_limit || 30;
  timer = setInterval(() => {
    if (timeLeft.value > 0) { timeLeft.value--; totalTimeTaken.value++; }
    else handleAnswerSelection(null, -1);
  }, 1000);
};

const triggerEffects = (type, event) => {
  screenFlash.value = type;
  setTimeout(() => screenFlash.value = null, 200);
  
  if (type === 'wrong') {
    isShaking.value = true;
    setTimeout(() => isShaking.value = false, 400);
  }
};

const addScorePopup = (event, text, type, combo = null) => {
  const id = ++popupId;
  const rect = event?.target?.getBoundingClientRect?.();
  scorePopups.value.push({ id, text, type, combo, x: rect?.left ?? window.innerWidth/2, y: rect?.top ?? window.innerHeight/2 });
  setTimeout(() => scorePopups.value = scorePopups.value.filter(p => p.id !== id), 1200);
};

const handleAnswerSelection = (event, index) => {
  if (selectedAnswer.value !== null) return;
  if (timer) clearInterval(timer);
  selectedAnswer.value = index;

  // Track the user's selected answer text for ML analysis
  const selectedOptionText = index >= 0 ? currentQuestion.value.options[index] : 'No answer (timed out)';
  userAnswers.value.push({
    question: currentQuestion.value.question,
    selectedAnswer: selectedOptionText,
    questionIndex: currentQuestionIndex.value
  });

  const isCorrect = index === currentQuestion.value.correctAnswer;
  
  if (isCorrect) {
    correctAnswers.value++;
    comboCount.value++;
    triggerEffects('correct', event);
    feedbackBorderClass.value = 'ring-4 ring-violet-500/50';
    
    let points = quiz.value.points_per_question || 10;
    
    if (quiz.value.quiz_type === 'streak') {
      streakCount.value++;
      points += streakCount.value * 5;
    } else if (quiz.value.quiz_type === 'boss_battle') {
      const damage = 100 / quiz.value.questions_data.length;
      lastBossDamage.value = Math.round(damage);
      showBossDamage.value = true;
      setTimeout(() => { showBossDamage.value = false; }, 800);
      bossHP.value = Math.max(0, bossHP.value - damage);
    }
    
    if (comboCount.value >= 3) points += comboCount.value * 2;
    score.value += points;
    addScorePopup(event, `+${points}`, 'correct', comboCount.value >= 2 ? comboCount.value : null);
  } else {
    triggerEffects('wrong', event);
    feedbackBorderClass.value = 'ring-4 ring-red-500/50';
    comboCount.value = 0;
    streakCount.value = 0;
    addScorePopup(event, 'MISS', 'wrong');
  }

  setTimeout(() => {
    selectedAnswer.value = null;
    feedbackBorderClass.value = '';
    if (currentQuestionIndex.value < quiz.value.questions_data.length - 1) {
      currentQuestionIndex.value++;
      startTimer();
    } else finishQuiz();
  }, 1500);
};

const getOptionClass = (index) => {
  const base = isDark.value ? 'bg-purple-900/50 border-purple-500/50' : 'bg-white border-purple-200';
  if (selectedAnswer.value === null) return `${base} hover:-translate-y-2 cursor-pointer`;
  if (index === currentQuestion.value.correctAnswer) return 'bg-violet-500/20 border-violet-500 scale-[1.02]';
  if (selectedAnswer.value === index) return 'bg-rose-500/20 border-rose-500 animate-shake';
  return `${base} opacity-40`;
};

const getOptionStyle = (index) => {
  if (selectedAnswer.value === null) return { boxShadow: '0 6px 0 rgba(147, 51, 234, 0.4)' };
  if (index === currentQuestion.value.correctAnswer) return { boxShadow: '0 6px 0 rgba(16, 185, 129, 0.4)' };
  if (selectedAnswer.value === index) return { boxShadow: '0 6px 0 rgba(239, 68, 68, 0.4)' };
  return { boxShadow: '0 4px 0 rgba(147, 51, 234, 0.2)' };
};

const getOptionLetterClass = (index) => {
  if (selectedAnswer.value === null) return isDark.value ? 'bg-purple-800 text-purple-300 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-100 text-purple-500 group-hover:bg-purple-500 group-hover:text-white';
  if (index === currentQuestion.value.correctAnswer) return 'bg-violet-500 text-white';
  if (selectedAnswer.value === index) return 'bg-red-500 text-white';
  return isDark.value ? 'bg-purple-900 text-purple-500' : 'bg-purple-50 text-purple-300';
};

const finishQuiz = async () => {
  isFinished.value = true;
  if (timer) clearInterval(timer);
  if (!isReviewMode.value) {
    try {
      await api.post(`/api/v1/quizzes/${quiz.value.id}/submit`, {
        pointsEarned: score.value, correctCount: correctAnswers.value,
        totalQuestions: quiz.value.questions_data.length, timeTaken: totalTimeTaken.value,
        answers: userAnswers.value
      });
      await authStore.fetchUser();
    } catch (err) { console.error("Submit failed", err); }
  }
};

const triggerBack = () => { if (timer) clearInterval(timer); isBackModalOpen.value = true; };
const resumeQuiz = () => { isBackModalOpen.value = false; startTimer(); };
const confirmExit = () => router.push({ name: 'user.modules' });

const checkAttempt = async () => {
  try { return (await api.get(`/api/v1/quizzes/${route.params.id}/check-attempt`)).data.attempted || false; }
  catch { return false; }
};

onMounted(async () => {
  checkTheme();
  themeObserver = new MutationObserver(checkTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  
  try {
    if (await checkAttempt()) isReviewMode.value = true;
    quiz.value = (await api.get(`/api/v1/quizzes/${route.params.id}`)).data.quiz;
    loading.value = false;
    await nextTick();
    startTimer();
  } catch (err) { console.error(err); loading.value = false; }
});

onUnmounted(() => { clearInterval(timer); if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
/* 3D Cube */
.cube-3d {
  animation: cube-float 10s ease-in-out infinite;
  transform-style: preserve-3d;
}
.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(147, 51, 234, 0.3);
  backdrop-filter: blur(4px);
}
.cube-front { transform: translateZ(15px); }
.cube-back { transform: translateZ(-15px) rotateY(180deg); }
.cube-left { transform: translateX(-15px) rotateY(-90deg); }
.cube-right { transform: translateX(15px) rotateY(90deg); }
.cube-top { transform: translateY(-15px) rotateX(90deg); }
.cube-bottom { transform: translateY(15px) rotateX(-90deg); }
@keyframes cube-float { 
  0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); } 
  50% { transform: translateY(-30px) rotateX(180deg) rotateY(180deg); } 
}

/* Animations */
@keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } }
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.2); } }
.animate-breathe { animation: breathe 6s ease-in-out infinite; }
@keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) scale(0.5); opacity: 0; } }
.animate-float-up { animation: float-up 5s ease-in-out infinite; }
@keyframes spin-slow { 0% { transform: rotateY(0); } 100% { transform: rotateY(360deg); } }
.animate-spin-slow { animation: spin-slow 3s linear infinite; }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
.animate-shimmer { animation: shimmer 2s infinite; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.animate-shake { animation: shake 0.4s ease-in-out; }
@keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
.confetti { animation: confetti-fall 3s ease-in-out infinite; border-radius: 2px; }
.animate-in { animation: entry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes entry { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Transitions */
.flash-enter-active, .flash-leave-active { transition: opacity 0.2s; }
.flash-enter-from, .flash-leave-to { opacity: 0; }
.score-pop-enter-active { animation: score-pop 1.2s ease-out forwards; }
.score-pop-leave-active { opacity: 0; }
@keyframes score-pop { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { transform: translateY(-30px) scale(1.4); opacity: 1; } 100% { transform: translateY(-120px) scale(1); opacity: 0; } }
.icon-pop-enter-active { animation: icon-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
@keyframes icon-pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
.combo-pop-enter-active { animation: combo-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.combo-pop-leave-active { transition: all 0.2s; }
.combo-pop-leave-to { opacity: 0; transform: scale(0.8); }
@keyframes combo-pop { 0% { transform: scale(0) rotate(-10deg); } 100% { transform: scale(1) rotate(0); } }
.damage-pop-enter-active { animation: damage-pop 0.5s ease-out; }
.damage-pop-leave-active { transition: opacity 0.3s; }
.damage-pop-leave-to { opacity: 0; }
@keyframes damage-pop { 0% { transform: scale(0) translateY(10px); opacity: 0; } 50% { transform: scale(1.3) translateY(-10px); opacity: 1; } 100% { transform: scale(1) translateY(0); } }
.slide-right-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-right-leave-active { transition: all 0.3s ease-in; }
.slide-right-enter-from { opacity: 0; transform: translateX(60px) scale(0.95); }
.slide-right-leave-to { opacity: 0; transform: translateX(-60px) scale(0.95); }
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
