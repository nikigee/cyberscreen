<template>
    <div class="text-start">
        <!-- <h2 class="header_text text-xl-start text-center">宝LOOT</h2> -->
        <div v-if="loot.length > 0">
            <div class="text-primary text-uppercase border-bottom border-primary mb-2">Contents</div>
            <div class="">
                <div v-for="item in loot" class="text-primary d-flex flex-row loot-item my-1"
                    @click="handleClick(item)">
                    <div class="">
                        <div class="rarity bg-white text-white">|</div>
                    </div>
                    <div class="flex-grow-1 px-2">{{ item.name }} ({{ item.cost }} CR)</div>
                    <div class="px-1">{{ item.quantity }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAIStore } from '@/stores/datafort';
import { useLootStore } from '@/stores/stores';
import { ref } from 'vue';

const ai = useAIStore();
const lootStore = useLootStore();

let loot = lootStore.arr;

function handleClick(item) {
    if (isNaN(item.quantity)) {
        item.quantity = 0;
    } else {
        item.quantity--;
    }
    if (item.quantity <= 0) {
        const index = loot.indexOf(item);
        loot.splice(index, 1);
    }
}

</script>

<style lang="scss" scoped>
@import "@/assets/main.scss";

.rarity {
    width: 8px;
}

.loot-item {
    transition: 0.1s;
    cursor: pointer;
}

.loot-item:hover {
    background-color: $hcs-accent;
    color: black !important;
}
</style>