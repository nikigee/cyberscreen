<script setup>
import { onMounted } from 'vue';

import ActivityLog from '@/components/ActivityLog.vue';
import CombatTracker from '@/components/CombatTracker.vue';
import DiceRoller from '@/components/DiceRoller.vue';
import Room from '@/components/Room.vue';

import { useAIStore } from '@/stores/datafort'
import LootTable from '@/components/LootTable.vue';

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
    <div class="container-fluid px-4 text-center pt-2 mb-5">
        <div class="row justify-content-center">
            <!-- Auto generated room descriptions and references -->
            <div class="col-xl-3" v-if="room.display">
                <Room />
            </div>
            <!-- For tracking enemies and party members in combat -->
            <div class="col-xl-4 mb-3">
                <CombatTracker />
            </div>
            <!-- Log for activity and the dice tray to display dice rolls -->
            <div class="col-xl-3">
                <ActivityLog />
                <LootTable class="mt-3" />
                <DiceRoller class="mt-3" />
            </div>
        </div>
    </div>
</template>