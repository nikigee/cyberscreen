<script setup>
import CombatTracker from '@/components/CombatTracker.vue';
</script>

<template>
    <div class="container text-center pt-2 mb-5">
        <div class="row justify-content-center">
            <!-- For tracking enemies and party members in combat -->
            <div class="col-xl-6">
                <CombatTracker />
            </div>
        </div>
    </div>
</template>
