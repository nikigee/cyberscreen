<script setup>
import CombatTracker from '@/components/CombatTracker.vue';
</script>

<template>
    <div class="container text-center pt-2 mb-5">
        <div class="row justify-content-center">
            <!-- For tracking enemies and party members in combat -->
            <CombatTracker />
        </div>
    </div>
</template>
