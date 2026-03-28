<script setup lang="ts">
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-vue-next';
import { useNotifications } from '../composables/useNotifications';

const { toastQueue, dismissToast } = useNotifications();

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return CheckCircle2;
        case 'warning': return AlertTriangle;
        case 'error': return XCircle;
        default: return Info;
    }
};

const getStyles = (type: string) => {
    switch (type) {
        case 'success': return {
            bg: 'bg-white border-l-4 border-l-green-500',
            icon: 'text-green-500 bg-green-50',
            accent: 'bg-green-500',
            progress: 'bg-green-500'
        };
        case 'warning': return {
            bg: 'bg-white border-l-4 border-l-orange-400',
            icon: 'text-orange-500 bg-orange-50',
            accent: 'bg-orange-400',
            progress: 'bg-orange-400'
        };
        case 'error': return {
            bg: 'bg-white border-l-4 border-l-red-500',
            icon: 'text-red-500 bg-red-50',
            accent: 'bg-red-500',
            progress: 'bg-red-500'
        };
        default: return {
            bg: 'bg-white border-l-4 border-l-blue-500',
            icon: 'text-blue-500 bg-blue-50',
            accent: 'bg-blue-500',
            progress: 'bg-blue-500'
        };
    }
};
</script>

<template>
    <!-- Toast Container (fixed, bottom-right) -->
    <Teleport to="body">
        <div class="toast-container" aria-live="polite" aria-label="Notifications">
            <TransitionGroup name="toast" tag="div" class="toast-stack">
                <div
                    v-for="toast in toastQueue"
                    :key="toast.id"
                    :class="['toast-item', getStyles(toast.type).bg]"
                    role="alert"
                >
                    <!-- Icon -->
                    <div :class="['toast-icon', getStyles(toast.type).icon]">
                        <component :is="getIcon(toast.type)" class="w-5 h-5" />
                    </div>

                    <!-- Content -->
                    <div class="toast-content">
                        <p class="toast-title">{{ toast.title }}</p>
                        <p class="toast-message">{{ toast.message }}</p>
                    </div>

                    <!-- Close button -->
                    <button
                        @click="dismissToast(toast.id)"
                        class="toast-close"
                        :aria-label="`Dismiss: ${toast.title}`"
                    >
                        <X class="w-4 h-4" />
                    </button>

                    <!-- Progress bar -->
                    <div class="toast-progress-track">
                        <div
                            :class="['toast-progress', getStyles(toast.type).progress]"
                            :style="{ animationDuration: `${toast.duration}ms` }"
                        />
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    max-width: 380px;
    width: calc(100vw - 2rem);
}

.toast-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.toast-item {
    pointer-events: all;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1rem 1.25rem 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
    min-width: 280px;
}

.toast-icon {
    padding: 0.5rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
    margin-top: 2px;
}

.toast-content {
    flex: 1;
    min-width: 0;
}

.toast-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem;
    line-height: 1.3;
}

.toast-message {
    font-size: 0.8rem;
    color: #4B5563;
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
}

.toast-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    color: #9CA3AF;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    margin-top: 2px;
}

.toast-close:hover {
    background: #F3F4F6;
    color: #374151;
}

/* Progress bar */
.toast-progress-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.06);
}

.toast-progress {
    height: 100%;
    width: 100%;
    transform-origin: left;
    animation: shrink linear forwards;
    border-radius: 0 0 0 0.75rem;
}

@keyframes shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
}

/* Transition animations */
.toast-enter-active {
    animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
    animation: slideOut 0.25s ease-in forwards;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
    }
}
</style>
