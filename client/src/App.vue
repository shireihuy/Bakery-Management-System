<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import { useI18n } from './composables/useI18n'
import FloatingSettings from './components/FloatingSettings.vue'

const { autoLogin } = useAuth()
// Initialize composables to set up theme and locale on load
useTheme()
useI18n()

autoLogin()
</script>

<template>
  <RouterView />
  <FloatingSettings />
</template>
