<template>
    <div class="text-start">
        <h2 class="header_text header_bg text-xl-start text-center text-black py-1 px-2"
            :style="{ backgroundColor: accent }">
            {{ room.name }}
        </h2>
        <p>...</p>
        <!-- Render description with HTML formatting and transition -->
        <transition name="fade">
            <div v-if="description" v-html="description"></div>
        </transition>

        <transition name="fade">
            <h3 class="header_text h4 mt-4" :style="{ color: accent }" v-if="in_depth.poi">
                Points of Interest
            </h3>
        </transition>
        <transition name="fade">
            <div v-if="in_depth.poi" v-html="in_depth.poi"></div>
        </transition>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DOMPurify from 'dompurify';
import { useAIStore } from '@/stores/datafort';

const ai = useAIStore();
const room = ai.room;

const description = ref('');
const accent = ref('');
const in_depth = ref({});

// Save the room object to localStorage whenever it changes
watch(
    () => room,
    () => {
        try {
            localStorage.setItem('room', JSON.stringify(room));
        } catch (error) {
            console.error('Error saving room to localStorage:', error);
        }
    },
    { deep: true }
);

// Generate the description and accent color
async function generateRoomDetails() {
    description.value = ''; // Clear description to trigger transition
    in_depth.value = {};

    try {
        // Generate description if not available
        if (!room.description) {
            const promptText = `Generate a concise room description of this location: ${DOMPurify.sanitize(
                room.name
            )} for my cyberpunk red campaign with context: ${DOMPurify.sanitize(
                room.context
            )}. Don't include a title. No more than two paragraphs.`;
            const response = await ai.prompt(promptText, true);
            const formattedDescription = `<p>${response.replace(/\n/g, '</p><p>')}</p>`;
            room.description = DOMPurify.sanitize(formattedDescription);
        }
        description.value = room.description;

        // Generate accent color if not available
        if (!room.accent) {
            const promptText = `Based on this description: ${room.description}, generate a good bright neon color in CSS hex code for my dark cyberpunk black background web application. Just give the pure hex code and nothing else.`;
            const response = await ai.prompt(promptText, false);
            const hexCode = response.trim();
            if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexCode)) {
                room.accent = hexCode;
            } else {
                throw new Error('Invalid hex code received from AI');
            }
        }
        accent.value = room.accent;

        // Only run this if the user opts to make the room more detailed / in depth
        if (!room.enhance) {
            room.in_depth = {}; // clear if not enhanced
            return;
        }

        if (!room.in_depth.poi) {
            console.log("Room is enhanced.");

            const promptText = `Based on this description: ${room.description}, generate a list of at least four interactive rooms or points of interest in this room that players could interact with to find loot or clues or people to talk to in a cyberpunk red tabletop session. For each item, provide a brief description (one or two sentences) that is concise and directly relevant to the players' goals. Format the list with bold titles for each point of interest using **, followed by a colon and the description. Just give the list and don't have an intro.`;
            const response = await ai.prompt(promptText, true);

            // Replace **text** with <b>text</b> in the response
            const processedResponse = response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            // Process the response and assign it to in_depth.poi
            const formattedPOI = `<p>${processedResponse.replace(/\n/g, '</p><p>')}</p>`;
            room.in_depth.poi = DOMPurify.sanitize(formattedPOI);
        }
        in_depth.value.poi = room.in_depth.poi;



    } catch (error) {
        console.error('Error generating room details:', error);
    }
}


onMounted(generateRoomDetails);

// Regenerate details when room name or context changes
watch(
    () => [room.name, room.context, room.enhance],
    generateRoomDetails
);
</script>

<style scoped>
/* Fade transition for the description */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Accent color transition */
.header_bg {
    transition: color 0.5s ease-in-out;
    background-color: white;
}
</style>