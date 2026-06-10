<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  siteKey?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  verify: [token: string];
  expire: [];
}>();

const container = ref<HTMLDivElement | null>(null);
const widgetId = ref<string | null>(null);

const isEnabled = computed(() => Boolean(props.siteKey));

const waitForTurnstile = () => new Promise<void>((resolve, reject) => {
  const startedAt = Date.now();
  const poll = () => {
    if (window.turnstile) {
      resolve();
      return;
    }

    if (Date.now() - startedAt > 10000) {
      reject(new Error('Turnstile failed to initialize'));
      return;
    }

    window.setTimeout(poll, 50);
  };

  poll();
});

const loadTurnstile = () => new Promise<void>((resolve, reject) => {
  if (window.turnstile) {
    resolve();
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]');
  if (existingScript) {
    existingScript.addEventListener('load', () => waitForTurnstile().then(resolve, reject), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
    waitForTurnstile().then(resolve, reject);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.dataset.turnstileScript = 'true';
  script.onload = () => waitForTurnstile().then(resolve, reject);
  script.onerror = () => reject(new Error('Turnstile failed to load'));
  document.head.appendChild(script);
});

const removeWidget = () => {
  if (widgetId.value && window.turnstile) {
    window.turnstile.remove(widgetId.value);
  }
  widgetId.value = null;
  emit('expire');
};

const renderWidget = async () => {
  if (!isEnabled.value) {
    removeWidget();
    return;
  }

  await nextTick();
  if (!container.value || widgetId.value || !props.siteKey) return;

  try {
    await loadTurnstile();
    const turnstile = window.turnstile;
    if (!turnstile) return;

    widgetId.value = turnstile.render(container.value, {
      sitekey: props.siteKey,
      theme: 'light',
      callback: (token: string) => emit('verify', token),
      'expired-callback': () => emit('expire'),
      'error-callback': () => emit('expire')
    });
  } catch (err) {
    console.error(err);
    emit('expire');
  }
};

defineExpose({
  reset: () => {
    if (widgetId.value && window.turnstile) {
      window.turnstile.reset(widgetId.value);
      emit('expire');
    }
  }
});

onMounted(renderWidget);
onBeforeUnmount(removeWidget);

watch(() => props.siteKey, () => {
  removeWidget();
  renderWidget();
});
</script>

<template>
  <div v-if="isEnabled" class="flex justify-center">
    <div ref="container"></div>
  </div>
</template>
