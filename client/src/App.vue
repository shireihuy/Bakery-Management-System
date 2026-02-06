<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from './composables/useI18n'
import FloatingSettings from './components/FloatingSettings.vue'
import ChatBot from './components/ChatBot.vue'

useI18n() // Initialize i18n
</script>

<template>
  <RouterView />
  <FloatingSettings />
  <ChatBot />
</template>
