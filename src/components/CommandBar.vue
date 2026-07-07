<template>
    <div class="command-bar-wrapper">
        <div class="justify-content-center">
            <div class="input-group pt-3 position-relative">
                <input type="text" class="form-control command-input" placeholder="Enter command... (type 'help')"
                    v-model="commandParser.command" @keyup.enter="processCommand" @keydown.tab.prevent="handleTab"
                    @keydown.up.prevent="navigateHistory(-1)" @keydown.down.prevent="navigateHistory(1)"
                    ref="cmdInput" />
                <button class="btn btn-outline-primary" @click="processCommand">Run</button>

                <div v-if="suggestions.length > 0"
                    class="suggestions-dropdown list-group list-group-flush position-absolute w-100 mt-1 shadow-sm">
                    <button type="button" class="list-group-item list-group-item-action py-1 px-2"
                        v-for="(suggestion, index) in suggestions" :key="index"
                        :class="{ active: index === selectedSuggestionIndex }" @click="applySuggestion(suggestion)"
                        @mouseover="selectedSuggestionIndex = index">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong>{{ suggestion.text }}</strong>
                            <span class="text-muted small ms-2"
                                :class="{ 'text-light': index === selectedSuggestionIndex }">{{ suggestion.description
                                }}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCommandStore } from '@/stores/commandStore';

const commandParser = useCommandStore();
const cmdInput = ref(null);

const suggestions = computed(() => commandParser.currentSuggestions);
const selectedSuggestionIndex = ref(0);

watch(suggestions, () => {
    selectedSuggestionIndex.value = 0;
});

const handleTab = () => {
    if (suggestions.value.length > 0) {
        applySuggestion(suggestions.value[selectedSuggestionIndex.value]);
    }
};

const applySuggestion = (suggestion) => {
    commandParser.applySuggestion(suggestion.text);
    cmdInput.value.focus();
};

const processCommand = () => {
    commandParser.processCommand();
};

const navigateHistory = (dir) => {
    commandParser.navigateHistory(dir);
};
</script>

<style lang="css" scoped>
.command-input,
.btn {
    border-radius: 5px;
}

.command-bar-wrapper {
    position: relative;
    z-index: 1050;
    /* ensure it pops over other elements */
}

.suggestions-dropdown {
    top: 100%;
    z-index: 1060;
    max-height: 250px;
    overflow-y: auto;
    border-radius: 5px;
}

.list-group-item.active .text-muted {
    color: #f8f9fa !important;
}
</style>