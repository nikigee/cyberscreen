<template>
    <h2 class="header_text">敵HOSTILES</h2>
    <ul class="list-group list-group-flush">
        <li v-for="[key, entity] in entities" :key="key" class="list-group-item list-group-item-action" v-bind:class="{
            'list-group-item-primary': entity.currentHP <= 0,
            'selected friendly': commandParser.turnEntityId === key && entity.friendly,
            'selected enemy': commandParser.turnEntityId === key && !entity.friendly
        }" @click="quickSelect(key)">
            <Entity :entity="entity" :entityKey="key" />
        </li>
        <!-- If no entities -->
        <li class="list-group-item mt-1" v-if="entities.size == 0">
            <p class="m-0">Initialize...</p>
            <p class="m-0">No entities detected.</p>
            <p class="m-0 text-muted">hi ฅ^•ﻌ•^ฅ</p>
            <p class="m-0 text-muted">psst! to begin, type:</p>
            <p class="m-0 text-muted">entity add "name" "hp" "ac" "count"</p>

        </li>
    </ul>
</template>

<script setup>
import { ref } from 'vue';
import Entity from './Entity.vue'

import { useCommandStore } from '@/stores/commandStore';

const commandParser = useCommandStore();

// Reactive state for hostiles
const entities = ref(commandParser.entities);


const quickSelect = (key) => {
    return commandParser.quickSelect(key);
};
</script>


<style lang="css" scoped>
.selected {
    border-left: solid 3px;
}

.selected.friendly{
    border-left-color: var(--bs-secondary);
}

.selected.enemy{
    border-left-color: var(--bs-primary);
}

</style>