<template>
    <CcModal title="Initiative List" idd="initmenu">
        <div class="modal-body">
            <div>
                <div class="p-1 d-flex entry" v-for="entity in list">
                    <div>
                        <div>> {{ entity.name }} <span :class="getFriendly(entity.friendly)">
                                ({{ entity.id }})</span></div>
                        <div><span class="text-muted">initiative:</span> {{ formattedScore(entity.init.score) }}</div>
                    </div>
                    <div class="text-end d-flex align-items-center">
                        <div class="d-flex align-items-center">
                            <button class="btn fs-6 text-muted" @click="rollInit(entity)"><i
                                    class="bi bi-dice-5"></i></button> <input type="number" class="form-control"
                                v-model="entity.init.v" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline-primary" @click="convertEntities(entities)"><i
                    class="bi bi-sort-down-alt me-1"></i> Sort</button>
            <button class="btn btn-outline-primary" data-bs-dismiss="modal" @click="save()"><i
                    class="bi bi-floppy me-1"></i>Save & Close</button>
        </div>
    </CcModal>
</template>

<script setup>
import { ref } from 'vue';
import CcModal from './ui/ccModal.vue';
import { useCommandStore } from '@/stores/commandStore';
import { useMagicDice } from '@/stores/mdStore';

const { roll, cyberlog } = useMagicDice();

const { entities, saveEntities } = useCommandStore();

const list = ref([]);
convertEntities(entities, false);

function formattedScore(score) {
    let sign = "+";
    if (Math.sign(score) == -1) {
        sign = "-";
        score = score * -1;
    }

    return `${sign}${score}`;
}

function getFriendly(isFriendly) {
    return isFriendly ? "text-secondary" : "text-muted";
}

function rollInit(entity) {
    cyberlog.write(`${entity.name} (${entity.id}) rolled initiative:`);
    const rolledDice = roll(`d20 + ${entity.init.score}`, true);

    entity.init.v = rolledDice.total;
}

function save() {
    saveEntities();
}

function convertEntities(map, shouldSort = true) {
    let sortedList = Array.from(map.entries()) // convert Map → array of [key, value]
        .map(([key, value]) => ({ ...value })); // return objects
    if (shouldSort) {
        sortedList = sortedList.sort((a, b) => b.init.v - a.init.v) // sort DESC by .init.v
        console.log("list sorted: ", sortedList);
    }

    list.value = sortedList;
}


</script>

<style lang="css" scoped>
.entry {
    justify-content: space-between;
}

.entry .form-control {
    width: 4rem;
}
</style>