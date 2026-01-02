
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { autoLogin } = useAuth()
autoLogin()
</script>

<template>
  <RouterView />
</template>
