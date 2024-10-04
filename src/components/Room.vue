<template>
    <div class="text-start">
        <h2 class="header_text text-xl-start text-center">{{ room.name }}</h2>

        <p>...</p>
        <!-- Render description with HTML formatting -->
        <div v-html="description"></div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAIStore } from '@/stores/datafort';

const ai = useAIStore(); // grab room details
const room = ai.room; // Use the room object from the store

// Reference to store the generated description
const description = ref(room.description || '');

// Function to generate the description if it's not already available
async function generateDescription() {
    try {
        if (room.description) {
            // If a description already exists in the room object, use it
            description.value = room.description;
        } else {
            // Otherwise, generate a new description
            const promptText = `Generate a concise room description of this location: ${room.name} for my cyberpunk red campaign with context: ${room.context}. Don't include a title. No more than two paragraphs.`;
            const r = await ai.prompt(promptText, true);

            // Format the response and store it
            const formattedDescription = `<p>${r.replace(/\n/g, '</p><p>')}</p>`;
            description.value = formattedDescription;

            // Store the generated description back into the room object and localStorage
            room.description = formattedDescription;
            saveRoomToLocalStorage();
        }
    } catch (error) {
        console.error("Error generating description:", error);
    }
}

// Function to save the room object to localStorage
function saveRoomToLocalStorage() {
    localStorage.setItem('room', JSON.stringify(room));
}

// Watch for changes in the room object and save it to localStorage
watch(
    room,
    () => {
        generateDescription();
    },
    { deep: true } // Deep watch to detect changes in nested properties
);

onMounted(() => {
    generateDescription();
});
</script>
