<script setup>
import { computed } from 'vue';
import { useCommandStore } from '@/stores/commandStore';

const commandStore = useCommandStore();

const sortedEntities = computed(() => commandStore.sortedEntities);
const currentIndex = computed(() => commandStore.turnIndex);

const nextTurn = () => commandStore.nextTurn();
const prevTurn = () => commandStore.prevTurn();
const resetTurn = () => commandStore.resetTurn();

const getEntity = (offset) => {
  const N = sortedEntities.value.length;
  if (N === 0) return null;
  const index = (currentIndex.value + offset + N) % N;
  return sortedEntities.value[index];
};

const visibleOffsets = computed(() => {
  const N = sortedEntities.value.length;
  if (N === 0) return [];
  if (N === 1) return [0];
  if (N === 2) return [-1, 0, 1];
  return [-2, -1, 0, 1, 2];
});

const displaySlots = computed(() => {
  return visibleOffsets.value.map((offset, index) => {
    return {
      id: `${offset}_${index}`,
      entity: getEntity(offset),
      isCurrent: offset === 0,
      opacityClass: Math.abs(offset) === 2 ? 'opacity-25' : (Math.abs(offset) === 1 ? 'opacity-50' : '')
    };
  });
});


</script>

<template>
  <!-- <h2 class="header_text">導INITATIVE</h2> -->
  <div class="init-wheel-container my-3 p-2" v-if="sortedEntities.length > 0">
    <div class="d-flex align-items-center justify-content-center">
      <button class="btn btn-outline-secondary rounded-circle me-4 d-flex align-items-center justify-content-center"
        style="width: 40px; height: 40px;" @click="prevTurn">
        <i class="bi bi-chevron-left"></i>
      </button>

      <div class="d-flex align-items-center justify-content-center wheel-wrapper">
        <template v-for="slot in displaySlots" :key="slot.id">
          <!-- Current Entity -->
          <div v-if="slot.isCurrent" class="entity-card p-2 shadow-sm mx-2"
            :class="slot.entity.friendly ? 'current-turn-friendly border border-secondary text-secondary' : 'current-turn border border-primary text-primary'">
            <div class="fw-bold text-truncate" :title="slot.entity.name">{{ slot.entity.name }}</div>
            <div class="font-monospace opacity-75 mb-1" :class="slot.entity.friendly ? 'text-secondary' : 'text-primary'"
              style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ slot.entity.id }}</div>
            <div class="small fw-bold font-monospace badge text-dark mt-1"
              :class="slot.entity.friendly ? 'bg-secondary' : 'bg-primary'"><i class="bi bi-lightning-charge"></i> {{ slot.entity.init.v }}</div>
          </div>

          <!-- Non-Current Entity -->
          <div v-else class="entity-card text-muted mx-2" :class="slot.opacityClass">
            <div class="small fw-bold text-truncate" :title="slot.entity.name">{{ slot.entity.name }}</div>
            <div class="font-monospace text-muted mb-1" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ slot.entity.id }}</div>
            <div class="small font-monospace"><i class="bi bi-lightning-charge"></i> {{ slot.entity.init.v }}</div>
          </div>
        </template>
      </div>

      <button class="btn btn-outline-secondary rounded-circle ms-4 d-flex align-items-center justify-content-center"
        style="width: 40px; height: 40px;" @click="nextTurn">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    <div class="text-center mt-3 d-flex justify-content-center align-items-center position-relative">
      <span class="badge text-primary text-uppercase tracking-wider"
        style="letter-spacing: 2px; font-size: 0.65rem;">Initiative Tracker</span>
        
      <!-- Reset to top button -->
      <button v-if="currentIndex !== 0" @click="resetTurn" class="btn btn-sm btn-link text-primary p-0 ms-2 position-absolute" style="left: 0px;" title="Reset to Top">
        <i class="bi bi-skip-backward-fill"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>

.wheel-wrapper {
  min-width: 250px;
}

.badge {
  border-radius: 0px;
}

.entity-card {
  text-align: center;
  transition: all 0.3s ease;
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.current-turn {
  transform: scale(1.15);
  background: rgba(var(--bs-primary-rgb), 0.1);
}

.current-turn-friendly {
  transform: scale(1.15);
  background: rgba(var(--bs-secondary-rgb), 0.1);
}

.text-truncate {
  width: 100%;
}
</style>
