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
    <div class="container text-center pt-2 mb-5 main">
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
                <ActivityLog />
                <LootTable class="mt-3" />
                <DiceRoller class="mt-3" />
            </div>
        </div>
    </div>
    <div class="container position-sticky bottom-0 pb-4 parser">
        <CommandBar />
    </div>
</template>

<style lang="scss" scoped>
.parser{
    z-index: 90;
    left: 0;
    right: 0;
}
</style>