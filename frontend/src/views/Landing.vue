<template>
    <div
        class="min-h-screen bg-gradient-to-br from-platinum-50 via-white to-purple-50 dark:from-abyss-900 dark:via-abyss-800 dark:to-abyss-900">
        <!-- Navigation -->
        <LandingNav />

        <!-- Hero Section -->
        <HeroSection />

        <!-- Features Section -->
        <FeaturesSection />

        <!-- Impact Section -->
        <ImpactSection />

        <!-- About Section -->
        <AboutSection />

        <!-- Footer -->
        <LandingFooter />
    </div>
</template>

<script setup>
import LandingNav from '@/components/landing/LandingNav.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import ImpactSection from '@/components/landing/ImpactSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>
