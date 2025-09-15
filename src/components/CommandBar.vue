<template>
    <div>
        <div class="justify-content-center">
            <div class="input-group pt-3">
                <input type="text" class="form-control command-input" placeholder="Enter command..."
                    v-model="commandParser.command" @keyup.enter="processCommand" />
                <button class="btn btn-outline-primary" @click="processCommand">Run</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCommandStore } from '@/stores/commandStore';

const commandParser = useCommandStore();

// Function to add new hostile to the list
const processCommand = () => {
    return commandParser.processCommand();
};
</script>

<style lang="css" scoped>
.command-input, .btn {
    border-radius: 5px;
}
</style>