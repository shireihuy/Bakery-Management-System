<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FloatingSettings from './components/FloatingSettings.vue'

const { autoLogin } = useAuth()
useI18n() // Initialize i18n

autoLogin()
</script>

<template>
  <RouterView />
  <FloatingSettings />
</template>
