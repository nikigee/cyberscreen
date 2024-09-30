<script setup>
import ActivityLog from '@/components/ActivityLog.vue';
import CombatTracker from '@/components/CombatTracker.vue';
import DiceRoller from '@/components/DiceRoller.vue';
</script>

<template>
    <div class="container text-center pt-2 mb-5">
        <div class="row justify-content-center">
            <!-- For tracking enemies and party members in combat -->
            <div class="col-xl-6 mb-3">
                <CombatTracker />
            </div>
            <div class="col-xl-4">
                <ActivityLog />
                <DiceRoller class="mt-3" />
            </div>
        </div>
    </div>
</template>
