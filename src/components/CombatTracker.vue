<template>
    <h2 class="header_text">敵HOSTILES</h2>
    <ul class="list-group list-group-flush">
        <li v-for="[key, enemy] in enemies" :key="key" class="list-group-item list-group-item-action"
            v-bind:class="{ 'list-group-item-primary': enemy.currentHP <= 0 }" @click="quickSelect(key)">
            <Entity :entity="enemy" :entityKey="key" />
        </li>
        <!-- If no enemies -->
        <li class="list-group-item mt-1" v-if="enemies.size == 0">
            <p class="m-0">Initialize...</p>
            <p class="m-0">No enemies detected.</p>
            <p class="m-0 text-muted">hi ฅ^•ﻌ•^ฅ</p>
            <p class="m-0 text-muted">psst! to begin, type:</p>
            <p class="m-0 text-muted">enemy add "name" "hp" "ac" "count"</p>

        </li>
    </ul>
</template>

<script setup>
import { ref } from 'vue';
import Entity from './Entity.vue'

import { useCommandStore } from '@/stores/commandStore';

const commandParser = useCommandStore();

// Reactive state for hostiles
const enemies = ref(commandParser.enemies);


const quickSelect = (key) => {
    return commandParser.quickSelect(key);
};
</script>
