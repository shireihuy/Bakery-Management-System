import { ref, onMounted } from 'vue';

const isDark = ref(false);

export function useTheme() {
    const toggleTheme = () => {
        isDark.value = !isDark.value;
        updateTheme();
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    };

    const updateTheme = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            isDark.value = true;
        } else {
            isDark.value = false;
        }
        updateTheme();
    });

    return {
        isDark,
        toggleTheme
    };
}
