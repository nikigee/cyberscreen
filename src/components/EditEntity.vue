<template>
    <CcModal title="Edit entity" idd="entityEdit">
        <form @submit.prevent="save" v-if="editEntityID">
            <div class="modal-body">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input id="name" v-model="form.name" class="form-control" type="text" />
                </div>
                <div class="row">
                    <div class="mb-3 col">
                        <label for="currentHP" class="form-label">Current HP</label>
                        <input id="currentHP" v-model.number="form.currentHP" class="form-control" type="number"
                            min="0" />
                    </div>
                    <div class="mb-3 col">
                        <label for="maxHP" class="form-label">Max HP</label>
                        <input id="maxHP" v-model.number="form.maxHP" class="form-control" type="number" min="0" />
                    </div>
                </div>
                <div class="mb-3">
                    <label for="ac" class="form-label">Armor Class (AC)</label>
                    <input id="ac" v-model.number="form.ac" class="form-control" type="number" min="0" />
                </div>
                <div class="mb-3">
                    <label for="initScore" class="form-label">Initiative Modifier</label>
                    <input id="initScore" v-model.number="form.init.score" class="form-control" type="number" min="0" />
                </div>
                <div class="row">
                    <div class="col mb-3">
                        <label for="notes" class="form-label">Notes (comma separated)</label>
                        <input id="notes" v-model="notesString" class="form-control" type="text" />
                    </div>
                    <div class="col mb-3">
                        <label for="inv" class="form-label">Inventory (comma separated)</label>
                        <input id="inv" v-model="invString" class="form-control" type="text" />
                    </div>
                </div>
                <div class="mb-3">
                    <label for="friendly" class="form-label me-2">Friendly</label>
                    <input id="friendly" v-model="form.friendly" class="form-check-input" type="checkbox" />
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" @click="cancel" data-bs-dismiss="modal"><i
                        class="bi bi-x me-1"></i> Cancel</button>
                <button type="submit" class="btn btn-outline-primary" data-bs-dismiss="modal" @click="save"><i
                        class="bi bi-floppy me-1"></i> Save</button>
            </div>
        </form>
        <div class="modal-body" v-else>
            <p class="text-muted">No entity selected.</p>
        </div>
    </CcModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCommandStore } from '@/stores/commandStore';
import CcModal from './ui/ccModal.vue';
import { storeToRefs } from 'pinia';

const store = useCommandStore();
const { editEntityID } = storeToRefs(store);

// Create a reactive copy of the entity for editing
const form = ref({});

watch(editEntityID, () => {
    if (editEntityID.value) {
        const entity = store.entities.get(editEntityID.value);
        form.value = deepCopy(entity);
    }
})

// Deep copy utility
function deepCopy(obj) {
    if (obj)
        return JSON.parse(JSON.stringify(obj));
    else
        return {};
}

// Computed for notes and inventory as comma separated strings
const notesString = computed({
    get: () => form.value.notes?.join(', ') || '',
    set: val => form.value.notes = val.split(',').map(s => s.trim()).filter(Boolean)
});
const invString = computed({
    get: () => form.value.inv?.join(', ') || '',
    set: val => form.value.inv = val.split(',').map(s => s.trim()).filter(Boolean)
});

function save() {
    store.entities.set(editEntityID.value, deepCopy(form.value));
    store.saveEntities();
}

function cancel() {
    const entity = store.entities.get(editEntityID.value);
    form.value = deepCopy(entity);
}
</script>