<script setup>
import { onMounted } from 'vue';

import ActivityLog from '@/components/ActivityLog.vue';
import CombatTracker from '@/components/CombatTracker.vue';
import DiceRoller from '@/components/DiceRoller.vue';
import Room from '@/components/Room.vue';

import { useAIStore } from '@/stores/datafort'
import LootTable from '@/components/LootTable.vue';
import CommandBar from '@/components/CommandBar.vue';

const room = useAIStore().room;

// Function to retrieve the room object from localStorage if available
function loadRoomFromLocalStorage() {
    const storedRoom = JSON.parse(localStorage.getItem('room'));

    if (storedRoom) {
        // Parse the JSON string and assign it to room.value
        Object.assign(room, storedRoom);
    }
}
onMounted(() => {
    loadRoomFromLocalStorage();
});
</script>

<template>
    <div class="container text-center pt-2 main">
        <div class="row justify-content-center">
            <!-- For tracking enemies and party members in combat -->
            <div class="col-lg mb-3">
                <!-- Auto generated room descriptions and references -->
                <div class="mb-5" v-if="room.display">
                    <Room />
                </div>
                <CombatTracker />
            </div>
            <!-- Log for activity and the dice tray to display dice rolls -->
            <div class="col-lg-4">
                <div class="sticky-lg-top">
                    <ActivityLog />
                    <!-- <div class="d-flex mt-2">
                        <button class="btn btn-outline-primary" type="button"><i class="bi bi-three-dots-vertical"></i> menu</button>
                    </div> -->
                    <LootTable class="mt-3" />
                    <DiceRoller class="mt-3" />
                </div>
            </div>
        </div>

    </div>
    <div class="container sticky-bottom pb-4 pt-2 mt-3 parser">
        <div class="d-flex footer justify-content-between align-items-center">
            <div class="text-secondary microsystems text-start d-flex align-items-center"><i
                    class="bi bi-triangle me-2"></i>
                <div>
                    <div>biomon systems online</div>
                    <div>v2.3 - up to date</div>
                </div>
            </div>
            <div class="text-primary watermark text-end"><div>2083</div><div>hades ฅ^•ﻌ•^ฅ</div></div>
        </div>
        <CommandBar />
    </div>
</template>

<style lang="scss" scoped>
.parser {
    z-index: 90;
    left: 0;
    right: 0;
    background: linear-gradient(#0000006b, var(--bs-body-bg));
}

.microsystems {
    font-size: 10px;
}

@keyframes spin {
    from {
        transform: rotate3d(0, 0, 0, 0deg);
    }

    to {
        transform: rotate3d(0, 1, 0, 360deg);
    }
}

.footer {
    perspective: 1000px;
}

.microsystems i {
    font-size: 16px;
    animation: spin 2s linear infinite;
    transform-style: preserve-3d;
}

.watermark {
    font-size: 12px;
}
</style>