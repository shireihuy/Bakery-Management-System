<template>
  <div v-if="activeSales && activeSales.length > 0" class="flash-system">
    <!-- Inline Banner / Trigger -->
    <div 
      v-if="!isOpen" 
      class="flash-inline-banner"
      @click="isOpen = true"
    >
      <div class="banner-body">
        <div class="banner-tag">LIVE NOW</div>
        <div class="banner-text">
          <span class="bolt-text">⚡</span>
          {{ saleNames }} — Exclusive Discounts Available!
        </div>
        <button class="banner-action">VIEW DEALS</button>
      </div>
    </div>

    <!-- Top-Down Overlay -->
    <div 
      v-if="isOpen" 
      class="flash-overlay-top"
      @click="isOpen = false"
    >
      <div 
        class="flash-sheet-top" 
        @click.stop
      >
        <div class="sheet-header">
          <div class="h-left">
            <span class="l-bolt">⚡</span>
            <h2>FLASH DEALS</h2>
          </div>
          <button @click="isOpen = false" class="sheet-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="sheet-body scrollbar-hide">
          <div v-for="sale in activeSales" :key="sale.id" class="sheet-sale-section">
            <!-- Sale Title and Individual Countdown -->
            <div class="sale-section-header">
              <span class="sale-title-text">{{ sale.name }}</span>
              <div class="sale-section-timer">
                <span class="t-label-mini">ENDS IN</span>
                <span class="t-value-mini">{{ countdowns[sale.id]?.h || '00' }}:{{ countdowns[sale.id]?.m || '00' }}:{{ countdowns[sale.id]?.s || '00' }}</span>
              </div>
            </div>
            
            <div class="sheet-items">
              <div v-for="item in sale.items" :key="item.id" class="sheet-item-row">
                <div class="s-img">
                  <img :src="item.image" :alt="item.name" />
                </div>
                
                <div class="s-info">
                  <div class="s-main">
                    <h3>{{ item.name }}</h3>
                    <div class="s-prices">
                      <span class="s-old">${{ parseFloat(item.original_price).toFixed(2) }}</span>
                      <span class="s-new">${{ parseFloat(item.sale_price).toFixed(2) }}</span>
                    </div>
                  </div>

                  <div class="s-status">
                    <div class="s-bar-bg">
                      <div class="s-bar-fill" :style="{ width: (item.sold_quantity / item.flash_sale_stock * 100) + '%' }"></div>
                    </div>
                    <span class="s-text">{{ Math.round((item.sold_quantity / item.flash_sale_stock) * 100) }}% claimed</span>
                  </div>
                </div>

                <div class="s-action">
                  <button 
                    @click="$emit('add-to-cart', item, $event)" 
                    class="s-btn"
                    :disabled="item.sold_quantity >= item.flash_sale_stock"
                  >
                    {{ item.sold_quantity >= item.flash_sale_stock ? 'SOLD' : 'GRAB' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sheet-footer">
          ⭐ Limited time offers. Be quick!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  activeSales: {
    type: Array,
    required: true
  }
});

defineEmits(['add-to-cart']);

const isOpen = ref(false);
const countdowns = ref({});
let interval;

const totalItems = computed(() => {
    return props.activeSales.reduce((acc, sale) => acc + sale.items.length, 0);
});

const saleNames = computed(() => {
    if (!props.activeSales || props.activeSales.length === 0) return '';
    return props.activeSales.map(s => s.name).join(' & ');
});

const updateCountdowns = () => {
    const now = new Date().getTime();
    props.activeSales.forEach(sale => {
        const end = new Date(sale.end_time).getTime();
        const diff = end - now;
        
        if (diff > 0) {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            countdowns.value[sale.id] = {
                h: h.toString().padStart(2, '0'),
                m: m.toString().padStart(2, '0'),
                s: s.toString().padStart(2, '0')
            };
        } else {
            countdowns.value[sale.id] = { h: '00', m: '00', s: '00' };
        }
    });
};

onMounted(() => {
    updateCountdowns();
    interval = setInterval(updateCountdowns, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});
</script>

<style scoped>
.flash-system {
  margin-bottom: 2rem;
}

/* Inline Banner Trigger */
.flash-inline-banner {
  background: #1a1a1a;
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.flash-inline-banner:hover {
  transform: translateY(-2px);
  background: #000;
  border-color: #ff4757;
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.1);
}

.banner-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-tag {
  background: #ff4757;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.2rem 0.6rem;
  border-radius: 2rem;
  letter-spacing: 1px;
}

.banner-text {
  flex: 1;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
}

.bolt-text {
  color: #ffcc00;
  margin-right: 0.4rem;
}

.banner-action {
  background: transparent;
  color: #ff4757;
  border: 1px solid #ff4757;
  padding: 0.4rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.flash-inline-banner:hover .banner-action {
  background: #ff4757;
  color: #fff;
}

/* Top-Down Overlay */
.flash-overlay-top {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
  animation: fade-in 0.3s ease;
}

.flash-sheet-top {
  width: 100%;
  max-width: 700px;
  background: #121212;
  border-radius: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  animation: slide-down 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.sheet-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.h-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.h-left h2 {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  margin: 0;
}

.l-bolt {
  font-size: 1.5rem;
  animation: pulse 1.5s infinite;
}

.h-timer {
  display: flex;
  column-gap: 0.75rem;
  background: #1a1a1a;
  padding: 0.4rem 1rem;
  border-radius: 3rem;
  align-items: center;
}

.t-label {
  font-size: 0.65rem;
  color: #ff4757;
  font-weight: 800;
}

.t-value {
  color: #fff;
  font-family: monospace;
  font-weight: 900;
  font-size: 1rem;
}

.sheet-close {
  background: #232323;
  color: #666;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.sheet-close:hover {
  background: #ff4757;
  color: #fff;
  transform: rotate(90deg);
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.sheet-sale-section {
  margin-bottom: 2rem;
}

.sheet-sale-section:last-child {
  margin-bottom: 0;
}

.sale-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}

.sale-title-text {
  color: #ff4757;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sale-section-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
}

.t-label-mini {
  font-size: 0.55rem;
  color: #888;
  font-weight: 800;
}

.t-value-mini {
  color: #fff;
  font-family: monospace;
  font-weight: 800;
  font-size: 0.8rem;
}

.sheet-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sheet-item-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255,255,255,0.03);
  transition: all 0.3s;
}

.sheet-item-row:hover {
  background: #222;
  border-color: rgba(255,71,87,0.2);
}

.s-img {
  width: 70px;
  height: 70px;
  border-radius: 1rem;
  overflow: hidden;
  flex-shrink: 0;
}

.s-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.s-info {
  flex: 1;
  min-width: 0;
}

.s-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.s-main h3 {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.s-old {
  font-size: 0.7rem;
  color: #555;
  text-decoration: line-through;
}

.s-new {
  color: #ff4757;
  font-weight: 900;
  font-size: 1.1rem;
}

.s-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.s-bar-bg {
  flex: 1;
  height: 4px;
  background: #000;
  border-radius: 2px;
  overflow: hidden;
}

.s-bar-fill {
  height: 100%;
  background: #ff4757;
}

.s-text {
  font-size: 0.65rem;
  color: #666;
  font-weight: 800;
  min-width: 60px;
  text-align: right;
}

.s-action {
  flex-shrink: 0;
}

.s-btn {
  background: #ff4757;
  color: #fff;
  border: none;
  width: 70px;
  height: 40px;
  border-radius: 1rem;
  font-weight: 900;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.s-btn:hover:not(:disabled) {
  background: #ff6b81;
  transform: scale(1.05);
}

.s-btn:disabled {
  background: #333;
  color: #555;
  cursor: not-allowed;
}

.sheet-footer {
  padding: 1.25rem;
  text-align: center;
  font-size: 0.7rem;
  color: #444;
  font-weight: 700;
  background: rgba(0,0,0,0.2);
  border-radius: 0 0 1.5rem 1.5rem;
}

@keyframes slide-down {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1.1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>



