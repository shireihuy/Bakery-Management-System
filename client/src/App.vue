<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from './composables/useI18n'
import FloatingSettings from './components/FloatingSettings.vue'
import ChatBot from './components/ChatBot.vue'
import SupportChat from './components/SupportChat.vue'
import NotificationToast from './components/NotificationToast.vue'

useI18n() // Initialize i18n
</script>

<template>
  <RouterView />
  <FloatingSettings />
  <ChatBot />
  <SupportChat />
  <NotificationToast />
</template>
